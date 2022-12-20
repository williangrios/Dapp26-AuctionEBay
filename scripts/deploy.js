const hre = require("hardhat");

async function main() {
  const EBay = await hre.ethers.getContractFactory("EbayChain");
  const eBay = await EBay.deploy();
  await eBay.deployed();
  console.log(
    `Deployed to ${eBay.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
