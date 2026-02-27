import BudgetClient from "@/components/admin/BudgetClient";
import { prisma } from "@/lib/db";

export default async function BudgetPage() {
  const categories = await prisma.budgetCategory.findMany({
    include: { items: true },
    orderBy: { sortOrder: "asc" },
  });
  return <BudgetClient initialCategories={categories} />;
}
