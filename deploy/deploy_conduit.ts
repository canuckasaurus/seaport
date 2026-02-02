import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ConduitController...");

  const ConduitController = await ethers.getContractFactory("ConduitController");
  const conduitController = await ConduitController.deploy();

  await conduitController.deployed();

  console.log(`ConduitController deployed to: ${conduitController.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
