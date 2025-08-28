# MyGov DAO
> EIP-2535 (Diamond pattern) DAO project.

MyGov DAO is a governance system for funding and community decisions.
It uses the Diamond Pattern to keep the contract modular and upgradeable, and has a React frontend built with Wagmi + RainbowKit + Shadcn/UI + TailwindCSS.

## Installing / Getting started
Clone the repo and install dependencies in both contracts/ and frontend/:
```shell
git clone https://github.com/abdarslan/mygov-dao.git
cd mygov-dao

# install contracts deps
cd contracts
npm install

# install frontend deps
cd ../frontend
npm install
```

## Developing
### 1.Compile and Deploy Contracts
Inside the contracts/ folder:
```shell
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network sepolia
```
This will generate ABIs and addresses into frontend/src/contract-data/.

### 2.Start Frontend
Inside the frontend/ folder:
```shell
npx run dev
```
Open http://localhost:5173 in your browser.

## Features

### 📊 Dashboard
Overview of DAO state:
- Number of projects  
- Number of surveys  
- Funded projects  
- Total funds  
- DAO treasury (**TlToken**)  
- Number of users  

### 📂 Projects
- Submit new project (URL, voting deadline, payment schedule)  
- Vote on proposals  
- Delegate vote  
- Withdraw payments (if approved)  

### 📋 Surveys
- Submit survey  
- Participate in active surveys  

### 💰 Token
- Check balances (**MyGov + TlToken**)  
- Transfer tokens  
- Claim **MyGov faucet**  
- Donate to DAO  
- Mint **TlToken** *(owner only)*  


## Configuration

- Contracts write their ABIs + addresses automatically into frontend/src/contract-data/.
- Supported networks: Hardhat, Sepolia (configurable in hardhat.config.ts and frontend/src/lib/wagmiConfig.ts).

## Contributing

- Contributions are welcome!
- Fork the repo
- Create a feature branch
- Submit a PR

We follow standard TypeScript + Solidity style.
## Licensing

- The code in this project is licensed under the MIT License.
"The code in this project is licensed under MIT license."
