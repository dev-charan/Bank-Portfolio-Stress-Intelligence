import prisma from "../config/database";

export class BorrowerService {
  // Find or create borrower
  async findOrCreateBorrower(
    borrowerName: string,
    pan: string | null,
    address: string | null,
  ) {
    const trimmedName = borrowerName.trim();

    // Try to find by name and PAN (if PAN exists)
    let borrower = await prisma.borrower.findFirst({
      where: {
        name: trimmedName,
        ...(pan && { pan: pan.trim() }),
      },
    });

    if (!borrower) {
      borrower = await prisma.borrower.create({
        data: {
          name: trimmedName,
          pan: pan?.trim() || null,
          address: address?.trim() || null,
        },
      });
      console.log(`✅ Created new borrower: ${trimmedName}`);
    }

    return borrower;
  }

  // Create or update director
  async upsertDirector(
    borrowerId: string,
    directorName: string,
    din: string | null,
    pan: string | null,
  ) {
    if (!directorName) return null;

    return await prisma.director.upsert({
      where: {
        borrowerId_name: {
          borrowerId,
          name: directorName.trim(),
        },
      },
      update: {
        din: din?.trim() || null,
        pan: pan?.trim() || null,
      },
      create: {
        borrowerId,
        name: directorName.trim(),
        din: din?.trim() || null,
        pan: pan?.trim() || null,
      },
    });
  }

  // Create or update guarantor
  async upsertGuarantor(
    borrowerId: string,
    guarantorName: string,
    cin: string | null,
    pan: string | null,
  ) {
    if (!guarantorName) return null;

    return await prisma.guarantor.upsert({
      where: {
        borrowerId_name: {
          borrowerId,
          name: guarantorName.trim(),
        },
      },
      update: {
        cin: cin?.trim() || null,
        pan: pan?.trim() || null,
      },
      create: {
        borrowerId,
        name: guarantorName.trim(),
        cin: cin?.trim() || null,
        pan: pan?.trim() || null,
      },
    });
  }
}
