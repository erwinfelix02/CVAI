// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StudentRegistration {

    struct Student {
        bytes32 dataHash;   // hashed student data
        uint256 timestamp;
    }

    Student[] public students;

    // Register student using hash instead of full strings
    function registerStudent(
        string memory _name,
        string memory _course,
        string memory _email
    ) public {

        // Create hash of all data
        bytes32 hash = keccak256(
            abi.encodePacked(_name, _course, _email)
        );

        students.push(
            Student(hash, block.timestamp)
        );
    }

    function getTotalStudents() public view returns (uint256) {
        return students.length;
    }

    function getStudent(uint256 index)
        public
        view
        returns (bytes32, uint256)
    {
        Student memory s = students[index];
        return (s.dataHash, s.timestamp);
    }
}