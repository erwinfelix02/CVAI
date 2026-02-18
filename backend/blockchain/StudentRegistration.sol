// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StudentRegistration {

    struct Student {
        string name;
        string course;
        string email;
        uint256 timestamp;
    }

    Student[] public students;

    function registerStudent(
        string memory _name,
        string memory _course,
        string memory _email
    ) public {
        students.push(
            Student(_name, _course, _email, block.timestamp)
        );
    }

    function getTotalStudents() public view returns (uint256) {
        return students.length;
    }

    function getStudent(uint256 index) public view returns (
        string memory,
        string memory,
        string memory,
        uint256
    ) {
        Student memory s = students[index];
        return (s.name, s.course, s.email, s.timestamp);
    }
}
