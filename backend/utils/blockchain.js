import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// 1️⃣ Connect to Sepolia
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);


// 2️⃣ Connect wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 3️⃣ Contract ABI (COPY FROM REMIX)
const contractABI = [
  "function registerStudent(string memory _fullName, string memory _course, string memory _email) public",
  "function getTotalStudents() public view returns (uint256)"
];

// 4️⃣ Connect to deployed contract
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

export default contract;
