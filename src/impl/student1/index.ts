import { StudentService } from "./impl";
import * as t from "../../../dist/api/student/types"

const service = new StudentService();


export const studentServiceImpl: t. StudentApi= {
	getGetAllStudent: service.getALL,
    getGetStudent:service.get,
	postCreateStudent: service.post,
	putUpdateStudent: service.put,
	deleteDeleteStudent: service.delete,
};