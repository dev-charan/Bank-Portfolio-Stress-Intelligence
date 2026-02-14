import prisma from "../config/database";

export class BankService {
  // Find or create bank
  async findOrCreateBank(bankName: string) {
    const trimmedName = bankName.trim();

    let bank = await prisma.bank.findUnique({
      where: { name: trimmedName },
    });

    if (!bank) {
      bank = await prisma.bank.create({
        data: { name: trimmedName },
      });
      console.log(`✅ Created new bank: ${trimmedName}`);
    }

    return bank;
  }

  // Find or create branch
  async findOrCreateBranch(bankId: string, branchName: string, state: string) {
    const trimmedBranch = branchName.trim();
    const trimmedState = state.trim();

    let branch = await prisma.branch.findUnique({
      where: {
        bankId_name_state: {
          bankId,
          name: trimmedBranch,
          state: trimmedState,
        },
      },
    });

    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          bankId,
          name: trimmedBranch,
          state: trimmedState,
        },
      });
      console.log(`✅ Created new branch: ${trimmedBranch} in ${trimmedState}`);
    }

    return branch;
  }

  // Get all banks with stats
  async getAllBanks() {
    return await prisma.bank.findMany({
      include: {
        branches: true,
        _count: {
          select: {
            records: true,
            branches: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
