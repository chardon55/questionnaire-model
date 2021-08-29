import IUpdateListener from "./update-listener"

export enum QuestionType {
    GENERIC, CHOICE, MULTI_CHOICE, FILL, TRUE_FALSE, OTHER,
}

export abstract class GenericQuestion {
    protected type: QuestionType = QuestionType.GENERIC
    protected title: string
    protected answer: string
    protected inputAnswer: string
    protected tag: string

    private onUpdateInputAnswer: IUpdateListener<string> = null

    public get Title() {
        return this.title
    }

    public get Answer() {
        return this.answer
    }

    public get InputAnswer() {
        return this.inputAnswer
    }

    public set InputAnswer(value: string) {
        if (!this.onUpdateInputAnswer) {
            this.inputAnswer = value
        } else {
            this.inputAnswer = this.onUpdateInputAnswer.onUpdate(this.inputAnswer, value)
        }
    }

    public get Tag() {
        return this.tag
    }

    public get OnUpdateInputAnswer() {
        return this.onUpdateInputAnswer
    }

    public set OnUpdateInputAnswer(listener: IUpdateListener<string>) {
        this.OnUpdateInputAnswer = listener
    }

    public clearInputAnswerListener() {
        this.onUpdateInputAnswer = null
    }

    protected constructor(title: string, answer: string, tag: string) {
        this.title = title
        this.answer = answer
        this.tag = tag

        this.inputAnswer = null
    }

    public toJsObject() {
        return {
            type: this.type,
            title: this.title,
            answer: this.answer,
            inputAnswer: this.inputAnswer,
            tag: this.tag,
        }
    }
}