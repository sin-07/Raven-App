import Admission, { IAdmission, IEnrolledCourse } from './Admission';

export type IStudent = IAdmission;
export type { IEnrolledCourse };

export const Student = Admission;
export default Admission;

