# Uniswap tokens

Созданы контракты Apple и Banana, Uniswap пара для них, c помощью Uniswap Factory из форка Mainnet

Перед запуском тестов запустите форк Mainnet'а:
```
npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/1pY6SgHEIf_6Wy52HqFNz9de6qt2xuPQ
```
Запуск тестов:
```
npx hardhat test --network localhost
```

Пример вывода:
```
  Uniswap
    Right owner
     -> Try to deploy Apple
     -> Success deployed Apple
      ✔ Should success deploy apple (1750ms)
     -> Try to deploy Banana
     -> Success deployed Banana
      ✔ Should success deploy banana (464ms)
    Deploy
     -> Try to deploy Apple
     -> Success deployed Apple
     -> Try to deploy Banana
     -> Success deployed Banana
      ✔ Should assign the total supply (848ms)
    Swap apple and banana
      -> Uniswap factory contract on: 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
      -> Uniswap pair
      -> Pair created on: 0xe3A7B9ac62b18D78f334f196e970e8780f2B16C6
      -> Liquidity created: reserves:  100 -- 10000
      -> Transfer 10
      -> After swap check balance
      ✔ After deployment swap should be completed (2104ms)


  4 passing (5s)
```