import IUpdateListener from "./update-listener"

export enum QuestionType {
    GENERIC, CHOICE, MULTI_CHOICE, FILL, TRUE_FALSE, OTHER,
}

export class GenericQuestion {
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

    public get IsCorrect(): boolean {
        return this.inputAnswer == this.Answer
    }

    public set OnUpdateInputAnswer(listener: IUpdateListener<string>) {
        this.OnUpdateInputAnswer = listener
    }

    public clearInputAnswerListener() {
        this.onUpdateInputAnswer = null
    }

    public constructor(title: string, answer: string, tag: string = null) {
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

export class MultipleChoiceQuestion extends GenericQuestion {
    protected choices: string[]
    protected correctChoiceIndices: number[]
    protected inputChoiceIndices: number[]

    public get Choices() {
        return this.choices
    }

    public get CorrectChoiceIndices() {
        return this.correctChoiceIndices
    }

    public get InputChoiceIndices() {
        return this.inputChoiceIndices
    }

    public set InputChoiceIndices(value: number[]) {
        this.inputChoiceIndices = value
    }

    public get Answer() {
        let s = ""

        for (let item of this.correctChoiceIndices) {
            s += (item + 1).toString()
        }

        return s
    }

    public get InputAnswer() {
        let s = ""

        for (let item of this.inputChoiceIndices) {
            s += (item + 1).toString()
        }

        return s
    }

    private lowerAlphabet = "abcdefghijklmnopqrstuvwxyz"
    private upperAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    public set InputAnswer(value: string) {
        let indices: number[] = []

        for (let item of value) {
            if (/^[1-9]$/.test(item)) {
                indices.push(parseInt(item) - 1)
            } else if (/^[a-z]$/.test(item)) {
                indices.push(this.lowerAlphabet.indexOf(item))
            } else if (/^[A-Z]$/.test(item)) {
                indices.push(this.upperAlphabet.indexOf(item))
            }
        }
    }

    public constructor(title: string, choices: string[], correctChoiceIndices: number[], tag: string = null) {
        super(title, "", tag)
        this.choices = choices
        this.correctChoiceIndices = correctChoiceIndices

        this.type = QuestionType.MULTI_CHOICE
    }
}

export class SingleChoiceQuestion extends MultipleChoiceQuestion {

    public get InputChoiceIndex(): number {
        return this.inputChoiceIndices[0]
    }

    public set InputChoiceIndex(value: number) {
        this.inputChoiceIndices = [value]
    }

    public get CorrectChoiceIndex(): number {
        return this.CorrectChoiceIndices[0]
    }

    public get InputChoiceIndices() {
        return this.inputChoiceIndices
    }

    public set InputChoiceIndices(value: number[]) {
        this.inputChoiceIndices = [value[0]]
    }

    public set InputAnswer(value: string) {
        super.InputAnswer = value[0]
    }

    public constructor(title: string, choices: string[], correctChoiceIndex: number, tag: string = null) {
        super(title, choices, [correctChoiceIndex], tag)

        this.type = QuestionType.CHOICE
    }
}

export class FillQuestion extends GenericQuestion {
    public constructor(title: string, answer: string, tag: string = null) {
        super(title, answer, tag)

        this.type = QuestionType.FILL
    }
}

export class TrueFalseQuestion extends SingleChoiceQuestion {
    public get InputOption() {
        return !!this.InputChoiceIndex
    }

    public set InputOption(value: boolean) {
        this.InputChoiceIndex = value ? 1 : 0
    }

    public get CorrectOption() {
        return !!this.CorrectChoiceIndex
    }

    public constructor(title: string, trueTitle: string, falseTitle: string, correctOption: boolean, tag: string = null) {
        super(title, [
            falseTitle,
            trueTitle,
        ], correctOption ? 1 : 0, tag)

        this.type = QuestionType.TRUE_FALSE
    }
}