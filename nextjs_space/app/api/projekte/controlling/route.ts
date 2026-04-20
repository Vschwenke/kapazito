import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const year = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const projects = await prisma.project.findMany({
      where: { isActive: true },
      include: {
        customer: { select: { id: true, name: true, shortName: true } },
        timeEntries: {
          where: { date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } },
          include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        },
        invoiceItems: {
          include: { invoice: { select: { status: true, totalAmount: true } } },
        },
      },
    });

    // Get personnel costs for cost calculation
    const personnelCosts = await prisma.personnelCost.findMany({ where: { year } });
    const empCostMap: Record<string, number> = {};
    for (const pc of personnelCosts) {
      empCostMap[pc.employeeId] = (empCostMap[pc.employeeId] ?? 0) + (pc.totalCost ?? 0);
    }

    const projectData = projects.map(p => {
      const totalHours = p.timeEntries.reduce((s, t) => s + (t.hours ?? 0), 0);
      const billableHours = p.timeEntries.reduce((s, t) => s + (t.billableHours ?? 0), 0);
      const rate = p.hourlyRate ?? 0;
      const revenue = billableHours * rate;
      const budgetHours = p.budgetHours ?? 0;
      const budgetUsedPercent = budgetHours > 0 ? (totalHours / budgetHours) * 100 : 0;
      const budgetRemaining = budgetHours > 0 ? budgetHours - totalHours : null;

      // Personnel costs: unique employees on this project, proportional hours
      const empHours: Record<string, number> = {};
      for (const te of p.timeEntries) {
        empHours[te.employeeId] = (empHours[te.employeeId] ?? 0) + (te.hours ?? 0);
      }
      let projectCosts = 0;
      const monthsActive = Math.max(currentMonth, 1);
      for (const [empId, hours] of Object.entries(empHours)) {
        const annualCost = empCostMap[empId] ?? 0;
        const hourlyEmpCost = annualCost > 0 ? annualCost / (monthsActive * 21 * 8) : 0;
        projectCosts += hours * hourlyEmpCost;
      }

      const profit = revenue - projectCosts;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      // Forecast: when will budget run out?
      const avgHoursPerMonth = totalHours > 0 && currentMonth > 0 ? totalHours / currentMonth : 0;
      const monthsUntilBudgetEmpty = budgetRemaining != null && avgHoursPerMonth > 0
        ? budgetRemaining / avgHoursPerMonth
        : null;

      // Monthly hours breakdown
      const monthlyHours: { month: number; hours: number; billable: number }[] = [];
      for (let m = 1; m <= 12; m++) {
        const mEntries = p.timeEntries.filter(t => new Date(t.date).getMonth() + 1 === m);
        if (mEntries.length > 0 || m <= currentMonth) {
          monthlyHours.push({
            month: m,
            hours: mEntries.reduce((s, t) => s + (t.hours ?? 0), 0),
            billable: mEntries.reduce((s, t) => s + (t.billableHours ?? 0), 0),
          });
        }
      }

      // Team members
      const teamMap: Record<string, { name: string; hours: number }> = {};
      for (const te of p.timeEntries) {
        const key = te.employeeId;
        if (!teamMap[key]) teamMap[key] = { name: `${te.employee.firstName} ${te.employee.lastName}`, hours: 0 };
        teamMap[key].hours += te.hours ?? 0;
      }

      return {
        id: p.id,
        name: p.name,
        customer: p.customer?.shortName ?? p.customer?.name ?? '-',
        customerId: p.customerId,
        rate,
        budgetHours,
        totalHours,
        billableHours,
        budgetUsedPercent,
        budgetRemaining,
        revenue,
        costs: projectCosts,
        profit,
        profitMargin,
        monthsUntilBudgetEmpty,
        monthlyHours,
        team: Object.values(teamMap).sort((a, b) => b.hours - a.hours),
        startDate: p.startDate,
        endDate: p.endDate,
      };
    });

    // Summary
    const totalRevenue = projectData.reduce((s, p) => s + p.revenue, 0);
    const totalCosts = projectData.reduce((s, p) => s + p.costs, 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const overBudget = projectData.filter(p => p.budgetUsedPercent > 90 && p.budgetHours > 0);

    return NextResponse.json({
      projects: projectData.sort((a, b) => b.revenue - a.revenue),
      summary: { totalRevenue, totalCosts, totalProfit, avgMargin, projectCount: projectData.length, overBudgetCount: overBudget.length },
    });
  } catch (error: any) {
    console.error('Projekt-Controlling API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
