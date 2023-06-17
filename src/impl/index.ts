import { StudentApi } from "../../dist/api/student/types";
import { ApiImplementation } from "../../dist/types";
import { studentServiceImpl } from "./student1";

export class ServiceImplementation implements  ApiImplementation {
    student: StudentApi= studentServiceImpl;
}