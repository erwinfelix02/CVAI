import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const courseContractABI = [
  "function addCourse(string _code, string _name, uint256 _yearLevels, string _department, string _status) public",
  "function updateCourse(uint256 index, string _code, string _name, uint256 _yearLevels, string _department, string _status) public",
  "function setCourseStatus(uint256 index, string _status) public",
  "function getTotalCourses() public view returns (uint256)",
];

const addr = process.env.COURSE_CONTRACT_ADDRESS;
if (!addr) console.warn("⚠️ COURSE_CONTRACT_ADDRESS missing in .env");

const courseContract = new ethers.Contract(addr, courseContractABI, wallet);

export default courseContract;