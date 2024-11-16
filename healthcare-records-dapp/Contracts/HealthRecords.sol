// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract HealthcareRecords{
    address owner;

    struct Record{
        uint256 recordID;
        string patientName;
        string diagnosis;
        string treatment;
        uint256 timestamp;
    }

    mapping (uint256 => Record[]) private patientRecords;

    mapping(address => bool) private authorizedProviders;

    modifier onlyOwner(){
        require(msg.sender==owner,"Only owner can perform this action");
        _;
    }

    modifier onlyAuthorizedProvider(){
         require(authorizedProviders[msg.sender],"Not an authorized patient/doctor");
        _;
    }
    
    constructor(){
        owner = msg.sender;

    }

    function getOwner() public view returns (address){
        return owner;
    }

    function authorizedProvider(address provider) public onlyOwner{
        authorizedProviders[provider]=true;
    }

    function addRecord(uint256 patientID,string memory patientName,string memory diagnosis,string memory treatment) public onlyAuthorizedProvider{
        uint256 recordID = patientRecords[patientID].length + 1;
        patientRecords[patientID].push(Record(recordID,patientName,diagnosis,treatment,block.timestamp));
    }

    function getPatientRecords(uint256 patientID) public view onlyAuthorizedProvider returns(Record[] memory){
        return patientRecords[patientID];
    }
}

//0xcc3a618f2d572d8986409e6e9e26c7674ad03edc