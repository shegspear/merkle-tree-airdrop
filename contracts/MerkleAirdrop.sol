// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import "./interface/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {

    address tokenAddress;
    bytes32 merkleRoot;
    address owner;

    struct User{
        address account;
        uint256 amount;
    }

    mapping(address => bool) paymentLedger;
    mapping(address => bool) approvedUsers;
    mapping (address => User) users;

    event YouQualify(address _account);
    event YouDontQualify(address _account);
    event RewardClaimed(address _account, uint256 _amount);

    error RewardAlreadyClaimed(); 
    error YouAreNotEligible();
    error VillagePeopleOOO();
    error HowBrokeAreYou();
    error YourFather();

    constructor(address _tokenAddress, bytes32 _merkleRoot) {
        tokenAddress = _tokenAddress;
        merkleRoot = _merkleRoot;
        owner = msg.sender;
    }

    function verify(
        bytes32[] memory proof,
        uint256 _amount
    )
        public
    {
        if(msg.sender == address(0)) {
            revert VillagePeopleOOO();
        }

        if(_amount == 0) {
            revert HowBrokeAreYou();
        }

        // bytes32 computedHash = keccak256(abi.encodePacked(msg.sender, _amount));
        bytes32 computedHash = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, _amount))));

        bool valid = MerkleProof.verify(proof, merkleRoot, computedHash);

        if(valid == true) {
            approvedUsers[msg.sender] = true;
            users[msg.sender] = User(msg.sender, _amount);
            emit YouQualify(msg.sender);
        } else {
            emit YouDontQualify(msg.sender);
        }
    }

    function claimAirdrop() external {
        if(msg.sender == address(0)) {
            revert VillagePeopleOOO();
        }

        if(approvedUsers[msg.sender] == false) {
            revert YouAreNotEligible();
        }

        if(paymentLedger[msg.sender] == true) {
            revert RewardAlreadyClaimed();
        }

        User memory user = users[msg.sender];

        IERC20(tokenAddress).transfer(msg.sender, user.amount);

        paymentLedger[msg.sender] == true;

        emit RewardClaimed(msg.sender, user.amount);
    }

    function updateMerkleTree(bytes32 _merkleTree) external {

        if(msg.sender == address(0)) {
            revert VillagePeopleOOO();
        }

        if(msg.sender == owner) {
            revert YourFather();
        }

        merkleRoot = _merkleTree;
    }

    function collectRemainingAirdrop() external {

        if(msg.sender == address(0)) {
            revert VillagePeopleOOO();
        }

        if(msg.sender == owner) {
            revert YourFather();
        }

        uint256 balance = IERC20(tokenAddress).balanceOf(address(this));

        IERC20(tokenAddress).transfer(msg.sender, balance);
    }

}