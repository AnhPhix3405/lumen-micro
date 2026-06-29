import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateExamDto {
    @ApiProperty({ example: "IELTS Listening Test 1" })
    name: string;

    @ApiProperty({ example: "Full IELTS listening practice test" })
    description: string;

    @ApiProperty({ example: 30 })
    durationMinutes: number;

    @ApiProperty({ example: 40 })
    totalScore: number;

    @ApiProperty({ example: "public" })
    visibility: string;

    @ApiPropertyOptional({ example: "https://cdn.example.com/thumb.jpg" })
    thumbnailUrl?: string;

    @ApiProperty({ example: "uuid-of-exam-type" })
    examTypeId: string;

    @ApiProperty({ example: false })
    isPublished: boolean;
}

export class UpdateExamDto {
    @ApiPropertyOptional({ example: "IELTS Listening Test 1" })
    name?: string;

    @ApiPropertyOptional({ example: "Updated description" })
    description?: string;

    @ApiPropertyOptional({ example: 30 })
    durationMinutes?: number;

    @ApiPropertyOptional({ example: 40 })
    totalScore?: number;

    @ApiPropertyOptional({ example: "public" })
    visibility?: string;

    @ApiPropertyOptional({ example: "https://cdn.example.com/thumb.jpg" })
    thumbnailUrl?: string;

    @ApiPropertyOptional({ example: "uuid-of-exam-type" })
    examTypeId?: string;

    @ApiPropertyOptional({ example: true })
    isPublished?: boolean;
}

export class CreatePartDto {
    @ApiProperty({ example: "Section 1" })
    name: string;

    @ApiProperty({ example: "listening" })
    type: string;

    @ApiProperty({ example: 1 })
    partOrder: number;

    @ApiPropertyOptional({ example: "Listen to the conversation and answer questions 1-5" })
    instruction?: string;

    @ApiProperty({ example: 10 })
    score: number;
}

export class CreateQuestionGroupDto {
    @ApiProperty({ example: 1 })
    groupOrder: number;

    @ApiProperty({ example: "Listen to the following conversation between two students..." })
    content: string;

    @ApiPropertyOptional({ example: "Full transcript text..." })
    transcript?: string;

    @ApiProperty({ example: "single" })
    type: string;
}

export class CreateQuestionInGroupDto {
    @ApiProperty({ example: "What is the speaker's main concern?" })
    content: string;

    @ApiPropertyOptional({ example: "The speaker mentions that..." })
    explanation?: string;

    @ApiPropertyOptional({ example: "https://cdn.example.com/audio/q.mp3" })
    audioUrl?: string;

    @ApiPropertyOptional({ example: "https://cdn.example.com/img/q.png" })
    imageUrl?: string;

    @ApiPropertyOptional({ example: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" } })
    options?: object;

    @ApiPropertyOptional({ example: { key: "B" } })
    correctOption?: object;

    @ApiPropertyOptional({ example: 1 })
    score?: number;

    @ApiProperty({ example: 1 })
    questionOrder: number;
}

export class CreateSeparateQuestionDto {
    @ApiProperty({ example: "What is the sum of 2 and 3?" })
    content: string;

    @ApiPropertyOptional({ example: "2 + 3 = 5" })
    explanation?: string;

    @ApiPropertyOptional({ example: "https://cdn.example.com/audio/q.mp3" })
    audioUrl?: string;

    @ApiPropertyOptional({ example: "https://cdn.example.com/img/q.png" })
    imageUrl?: string;

    @ApiPropertyOptional({ example: { A: "4", B: "5", C: "6", D: "7" } })
    options?: object;

    @ApiPropertyOptional({ example: { key: "B" } })
    correctOption?: object;

    @ApiPropertyOptional({ example: 1 })
    score?: number;

    @ApiProperty({ example: 1 })
    questionOrder: number;
}

export class UpdateQuestionDto {
    @ApiProperty({ example: "uuid" })
    questionId: string;

    @ApiPropertyOptional({ example: "Updated question content" })
    content?: string;

    @ApiPropertyOptional({ example: "Updated explanation" })
    explanation?: string;

    @ApiPropertyOptional({ example: "https://cdn.example.com/audio/q.mp3" })
    audioUrl?: string;

    @ApiPropertyOptional({ example: "https://cdn.example.com/img/q.png" })
    imageUrl?: string;

    @ApiPropertyOptional({ example: { A: "New A", B: "New B" } })
    options?: object;

    @ApiPropertyOptional({ example: { key: "A" } })
    correctOption?: object;

    @ApiPropertyOptional({ example: 2 })
    score?: number;

    @ApiPropertyOptional({ example: 1 })
    questionOrder?: number;
}

export class CreateSubmitDto {
    @ApiPropertyOptional({ example: 1800, description: "Time limit in seconds. Defaults to exam duration." })
    timeLimit?: number;
}

export class AnswerItemDto {
    @ApiProperty({ example: "uuid" })
    questionId: string;

    @ApiPropertyOptional({ example: { key: "B" } })
    selectedOption?: object;

    @ApiPropertyOptional({ example: "Written response text" })
    answerContent?: string;

    @ApiPropertyOptional({ example: "https://cdn.example.com/audio/answer.mp3" })
    audioUrl?: string;
}

export class SubmitAnswersDto {
    @ApiProperty({ type: [AnswerItemDto] })
    answers: AnswerItemDto[];
}

export class FinishSessionDto {
    @ApiPropertyOptional({ example: {} })
    body?: object;
}

export class ExamTypeResponse {
    @ApiProperty({ example: "uuid" })
    id: string;

    @ApiProperty({ example: "IELTS" })
    name: string;

    @ApiProperty({ example: "ielts" })
    code: string;

    @ApiPropertyOptional({ example: "IELTS exam type" })
    description?: string;
}

export class QuestionResponse {
    @ApiProperty({ example: "uuid" })
    id: string;

    @ApiProperty({ example: "group" })
    type: string;

    @ApiProperty({ example: "What is the speaker's main concern?" })
    content: string;

    @ApiPropertyOptional()
    explanation?: string;

    @ApiPropertyOptional()
    options?: object;

    @ApiProperty({ example: 1 })
    score: number;

    @ApiProperty({ example: 1 })
    questionOrder: number;
}

export class QuestionGroupResponse {
    @ApiProperty({ example: "uuid" })
    id: string;

    @ApiProperty({ example: "Listen to the following conversation..." })
    content: string;

    @ApiPropertyOptional()
    audioUrl?: string;

    @ApiPropertyOptional()
    transcript?: string;

    @ApiProperty({ example: 1 })
    groupOrder: number;

    @ApiProperty({ type: [QuestionResponse] })
    questions: QuestionResponse[];
}

export class PartResponse {
    @ApiProperty({ example: "uuid" })
    id: string;

    @ApiProperty({ example: "Section 1" })
    name: string;

    @ApiProperty({ example: "listening" })
    type: string;

    @ApiProperty({ example: 1 })
    partOrder: number;

    @ApiPropertyOptional()
    instruction?: string;

    @ApiProperty({ example: 10 })
    score: number;

    @ApiPropertyOptional({ type: [QuestionGroupResponse] })
    questionGroups?: QuestionGroupResponse[];
}

export class ExamResponse {
    @ApiProperty({ example: "uuid" })
    id: string;

    @ApiProperty({ example: "IELTS Listening Test 1" })
    name: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty({ example: 30 })
    durationMinutes: number;

    @ApiProperty({ example: 40 })
    totalScore: number;

    @ApiProperty({ example: "public" })
    visibility: string;

    @ApiPropertyOptional()
    thumbnailUrl?: string;

    @ApiProperty({ example: false })
    isPublished: boolean;

    @ApiPropertyOptional({ type: ExamTypeResponse })
    examType?: ExamTypeResponse;

    @ApiPropertyOptional({ type: [PartResponse] })
    parts?: PartResponse[];
}

export class SessionResponse {
    @ApiProperty({ example: "uuid" })
    sessionId: string;

    @ApiProperty()
    startedAt: Date;

    @ApiPropertyOptional()
    timeLimitSeconds?: number;
}

export class SubmitAnswersResponse {
    @ApiProperty({ example: "uuid" })
    sessionId: string;

    @ApiProperty({ example: 2 })
    answered: number;

    @ApiProperty({ example: [{ questionId: "uuid", answerId: "uuid" }] })
    answers: object[];
}

export class FinishSessionResponse {
    @ApiProperty({ example: "uuid" })
    sessionId: string;

    @ApiProperty({ example: "completed" })
    status: string;

    @ApiProperty({ example: 7 })
    totalScore: number;

    @ApiProperty({ example: 7 })
    totalCorrect: number;

    @ApiProperty({ example: 10 })
    totalQuestions: number;

    @ApiProperty({ example: 0.7 })
    correctRatio: number;

    @ApiProperty({ example: 1245 })
    durationSeconds: number;
}

export class CreateTopicDto {
    @ApiProperty({ example: "Listening" })
    name: string;

    @ApiPropertyOptional({ example: "Topics related to listening comprehension" })
    description?: string;
}

export class UpdateTopicDto {
    @ApiPropertyOptional({ example: "Reading" })
    name?: string;

    @ApiPropertyOptional({ example: "Topics related to reading comprehension" })
    description?: string;
}

export class ApiResponse {
    @ApiProperty()
    message: string;

    @ApiProperty({ example: 200 })
    status: number;
}
