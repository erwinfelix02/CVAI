// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CourseRegistry {
    struct Course {
        string code;
        string name;
        uint256 yearLevels;
        string department;
        string status;      // "Active" | "Inactive"
        uint256 timestamp;
    }

    Course[] public courses;

    event CourseAdded(uint256 indexed index, string code, string name);
    event CourseUpdated(uint256 indexed index, string code, string name);
    event CourseStatusChanged(uint256 indexed index, string status);

    function addCourse(
        string memory _code,
        string memory _name,
        uint256 _yearLevels,
        string memory _department,
        string memory _status
    ) public {
        courses.push(Course(_code, _name, _yearLevels, _department, _status, block.timestamp));
        emit CourseAdded(courses.length - 1, _code, _name);
    }

    function updateCourse(
        uint256 index,
        string memory _code,
        string memory _name,
        uint256 _yearLevels,
        string memory _department,
        string memory _status
    ) public {
        require(index < courses.length, "Invalid index");
        Course storage c = courses[index];
        c.code = _code;
        c.name = _name;
        c.yearLevels = _yearLevels;
        c.department = _department;
        c.status = _status;
        c.timestamp = block.timestamp;

        emit CourseUpdated(index, _code, _name);
    }

    function setCourseStatus(uint256 index, string memory _status) public {
        require(index < courses.length, "Invalid index");
        courses[index].status = _status;
        courses[index].timestamp = block.timestamp;

        emit CourseStatusChanged(index, _status);
    }

    function getTotalCourses() public view returns (uint256) {
        return courses.length;
    }

    function getCourse(uint256 index) public view returns (
        string memory,
        string memory,
        uint256,
        string memory,
        string memory,
        uint256
    ) {
        require(index < courses.length, "Invalid index");
        Course memory c = courses[index];
        return (c.code, c.name, c.yearLevels, c.department, c.status, c.timestamp);
    }
}