## Blockchain Integration Explanation

The CampusAI system uses **Ethereum blockchain (Sepolia Testnet)** to securely store student registration data.  
This ensures that once a student record is saved, it cannot be altered or deleted, providing transparency and security.

### How the Blockchain Connection Works

1. **Connecting to the Ethereum Network**

   The system connects to the **Sepolia test network** using an RPC provider.  
   The RPC URL is stored in an environment variable to keep configuration secure.

2. **Connecting a Wallet**

   A wallet is created using a **private key stored in the `.env` file**.  
   This wallet is used to **sign blockchain transactions** such as registering a student.

3. **Smart Contract Interaction**

   The backend connects to the deployed smart contract using:
   - The **contract address**
   - The **contract ABI (Application Binary Interface)**

   The ABI defines which functions the backend can call.

4. **Registering a Student**

   When a student registers in the system, the backend calls the smart contract function:

   `registerStudent(fullName, course, email)`

   This sends a transaction to the blockchain and stores the student's information permanently.

5. **Retrieving Blockchain Data**

   The system can also call read-only functions like:

   `getTotalStudents()`

   This retrieves the number of registered students stored in the smart contract.

### Why Blockchain is Used

- Ensures **data integrity** (records cannot be modified)
- Provides **transparent student verification**
- Prevents **tampering or unauthorized changes**
- Allows student data to be verified on the blockchain