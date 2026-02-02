import { ethers } from "hardhat";

async function main() {
  const conduitControllerAddress = process.env.CONDUIT_CONTROLLER_ADDRESS;

  if (!conduitControllerAddress) {
    throw new Error("Please set CONDUIT_CONTROLLER_ADDRESS in your environment variables.");
  }

  console.log("Deploying Seaport...");
  console.log(`Using ConduitController at: ${conduitControllerAddress}`);

  const Seaport = await ethers.getContractFactory("Seaport");
  const seaport = await Seaport.deploy(conduitControllerAddress);

  await seaport.deployed();

  console.log(`Seaport deployed to: ${seaport.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
