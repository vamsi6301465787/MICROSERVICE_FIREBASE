import { Api } from "../../../dist/models";
import * as t from "../../../dist/api/student/types";
import * as v from "../../../dist/validation";
import { db } from "../../db";



export class StudentService {
	private readonly collectionName: string;

	constructor() {
		this.collectionName = "students";
		this.getALL = this.getALL.bind(this);
		this.post = this.post.bind(this);
		this.delete = this.delete.bind(this);
		this.get = this.get.bind(this);
		this.put = this.put.bind(this);
	}

	/* *
	 ! Todo: Implement pagination for this service
	*/
	async getALL(limit: number | null | undefined, direction: Api.DirectionParamEnum | undefined, sortByField: string | null | undefined): Promise<t.GetGetAllStudentResponse> {
		try {
			const StudentQuerySnap = await db.collection(`${this.collectionName}`).get();
			const students: Api.StudentDto[] = StudentQuerySnap.docs
				.map((doc) => doc.data())
				.map((json) => v.modelApiStudentDtoFromJson("students", json));
			return {
				status: 200,
				body: {
					items: students,
					totalCount: students.length,
				},
			};
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async get(id: string): Promise<t.GetGetStudentResponse> {
		try {
			const StudentQuerySnap1 = await db.doc(`${this.collectionName}/${id}`).get();
			if (!StudentQuerySnap1.exists) {
				throw new Error("no-student-found");
			}
			const student1 = v.modelApiStudentDtoFromJson("students", StudentQuerySnap1.data());
			return {
				status: 200,
				body: student1,
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("no-student-found")) {
				return {
					status: 404,
					body: {
						message: "No student found with given id",
					},
				};
			}
			throw error;
		}
	}


	async post(request: Api.StudentDto): Promise<t.PostCreateStudentResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.id) {
				throw new Error("no-uId-found");
			}

			const Ref = db.collection(`${this.collectionName}`).doc(request.id);
			try {
				await this._checkUserExists(request.id);
			} catch (error: any) {
				if (error.toString().match("no-student-found")) {
					await Ref.set({
						...request,
						isExist: true,
						id: Ref.id,
						createdAt: new Date().toISOString(),
					});
					return {
						status: 201,
						body: request,
					};
				}
			}
			throw new Error("student-already-exists");
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No id found in request",
					},
				};
			}

			if (error.toString().match("student-already-exists")) {
				return {
					status: 422,
					body: {
						message: "student already exists with given id",
					},
				};
			}
			throw error;
		}
	}

	async put(request: Api.StudentDto): Promise<t.PutUpdateStudentResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.id) {
				throw new Error("no-uId-found");
			}

			const Ref = db.collection(`${this.collectionName}`).doc(request.id);
			const Res = await this._checkUserExists(request.id);
			await Ref.update({
				...request,
				updatedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					...Res,
					...request,
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No id found in request",
					},
				};
			}

			throw error;
		}
	}

	async delete(id: string): Promise<t.DeleteDeleteStudentResponse> {
		try {
			await this._checkUserExists(id);
			const Ref = db.collection(`${this.collectionName}`).doc(id);
			await Ref.update({
				isExist: false,
				deletedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					message: "student deleted successfully",
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error?.response?.status === 404) {
				return {
					status: 404,
					body: {
						message: "student already deleted or no student found",
					},
				};
			}
			throw error;
		}
	}

	private async _checkUserExists(id: string) {
		const response = await this.get(id);
		if (response.status === 404) {
			throw new Error("no-student-found");
		}
		return response.body;
	}
}
