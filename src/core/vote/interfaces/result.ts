import { Candidate } from "../../candidate/entities/candidate.entity";

export interface Result {
    candidate: Candidate
    quantity: number
}