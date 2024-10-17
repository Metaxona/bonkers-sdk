---
title: Upcoming Features
group: Documents
---

## [ ] Validator/Parser [Planning]

A way to validate methods and arguments for contract interactions.

This would help validate inputs for client side applications and
parse them to something valid before the method is even called

This will specially help for building generic functions like:

```ts

const controller = new Controller(config)

async function triggerControllerContract(contractAddress: Address, method: ControllerMethods, args: any[]){
  const chainId = controller.chain().id
  const controllerParams = await controller.getParams(chainId, contractAddress)
  
  controller.useNewContract(chainId, controllerParams)
  
  return await controller[method](...args)
}

// or a more generic one

const bonkers = new BonkersSDK(config)

async function triggerContract(contractType: ContractType, contractAddress: Address, method: ControllerMethods, args: any[]){
  const chainId = bonkers.chain().id
  const params = await bonkers.getParams(chainId, contractAddress, contractType)

  const contract = bonkers[contractTypeFormatter(contractType)]

  contract.useNewContract(chainId, params)
  
  return await contract[method](...args)
}

```

which would help simplify contract interactions for server applications and for form based client interactions allowing for it to be used by a single handler

### Example

> Pattern being used in example
> [Contract Type] [Contract Method] [Contract Params]

#### Valid

[CONTROLLER] [balance] [None]  
[CONTROLLER] [isController] [0x...123]  

#### Invalid

[CONTROLLER] [isController] [None]  
[CONTROLLER] [something] [None]  

### Todo 2

- [ ] Method Validator
  - will validate if the selected method exist in a class
- [ ] Method Args Validator
  - will validate if the args being passed to the method is correct
- [ ] Method Args Parser
  - will handle the parsing of the args to ones that can be used by
the class while also handling validations
- [ ] add tests
