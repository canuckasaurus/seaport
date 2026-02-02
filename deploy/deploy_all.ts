import { ethers } from "hardhat";

async function main() {
  // 1. Deploy ConduitController
  console.log("--- Deploying ConduitController ---");
  const ConduitController = await ethers.getContractFactory("ConduitController");
  const conduitController = await ConduitController.deploy();
  await conduitController.deployed();
  console.log(`ConduitController deployed to: ${conduitController.address}`);

  // 2. Deploy Seaport
  console.log("\n--- Deploying Seaport ---");
  const Seaport = await ethers.getContractFactory("Seaport");
  const seaport = await Seaport.deploy(conduitController.address);
  await seaport.deployed();
  console.log(`Seaport deployed to: ${seaport.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
