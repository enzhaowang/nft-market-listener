//SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;


//@title multiple signature wallet
//@notice A contract that allows multiple parties to agree on transactions before execution.
contract ContractWallet {
    //event of deposit
    event Deposit(address indexed sender, uint256 amount, uint256 balance);

    //event of submit transaction
    event SubmitTransaction(address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes data);

    //event of confirm transaction
    event ConfirmTransaction(uint256 indexed txIndex, address indexed owner);

    //event of revoke confirmation
    event RevokeConfirmation(uint256 indexed txIndex, address indexed owner);

    //event of excute transaction
    event ExecuteTransaction(uint256 indexed txIndex, address indexed to, uint256 value, bytes data);

    //owners array
    address[] public owners;

    //mapping to check if an address is owner
    mapping(address => bool) public isOwner;

    //number of confirmation required
    uint256 public numConfirmationsRequired;


    //struct of transaction
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }


    //list of transactions
    Transaction[] public transactions;

    //mapping from tx index => owner => bool
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    //modifier to check if caller is owner
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not owner");
        _;
    }

    //modifier of if transaction exists
    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "Transaction does not exist");
        _;
    }

    //modifer if not executed
    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Transaction has already been executed");
        _;
    }

    //modifer of not confirmed by caller
    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Transaction already confirmed by caller");
        _;
    }

    //constructor
    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "Owners required");
        require(_numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length, "Number of confirmations required must be greater than 0 and less than or equal to the number of owners");

        //initialize owners
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    //receive function to receive ether
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    //function to submit transaction
    function submitTransaction(address _to, uint256 _value, bytes memory _data) public onlyOwner {
        uint256 txIndex = transactions.length;

        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0
        }));

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    //confirm transaction
    function confirmTransaction(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex) {
 
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations++;
        isConfirmed[_txIndex][msg.sender] = true;
        
        emit ConfirmTransaction(_txIndex, msg.sender);

    }


    //execute transaction
    function executeTransaction(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];

        require(transaction.numConfirmations >= numConfirmationsRequired, "Cannot execute transaction");

        transactions[_txIndex].executed = true;

        (bool success,) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction failed");

        emit ExecuteTransaction(_txIndex, transaction.to, transaction.value, transaction.data);
        
    }


    //revoke confirmation
    function revokeConfirmation(uint256 _txIndex) public onlyOwner txExists(_txIndex) notExecuted(_txIndex){
        Transaction storage transaction = transactions[_txIndex];

        require(isConfirmed[_txIndex][msg.sender], "Transaction not confirmed");

        transaction.numConfirmations--;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(_txIndex, msg.sender);
    }

    //get owners
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    //get transaction count
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }

    //get transaction
    function getTransaction(uint _txIndex) public view returns (
        address to,
        uint256 value,
        bytes memory data,
        bool executed,
        uint256 numConfirmations
    ) {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }



}