import IUpdateListener from "./update-listener"

export function convertToQuestion(obj: any): GenericQuestion {
    let instance

    switch (obj.type) {
        case 1:
            instance = new SingleChoiceQuestion(obj?.title, obj?.choices, obj?.correctChoiceIndices[0], obj?.tag)
            instance.InputChoiceIndices = obj?.inputChoiceIndices ?? []
            break
        case 2:
            instance = new MultipleChoiceQuestion(obj?.title, obj?.choices, obj?.correctChoiceIndices, obj?.tag)
            instance.InputChoiceIndices = obj?.inputChoiceIndices ?? []
            break
        case 4:
            let indices = obj?.correctChoiceIndices ?? [null]
            if (indices.length === 0) {
                indices = [null]
            }

            const value = indices[0] === 1 ? true : indices[0] === 0 ? false : null
            const list = obj?.choices ?? ["", ""]

            instance = new TrueFalseQuestion(obj?.title, list[1], list[0], value, obj?.tag)
            instance.InputOption = !obj?.inputChoiceIndices ? null : obj.inputChoiceIndices[0] === 1 ? true : obj.inputChoiceIndices[0] === 0 ? false : null
            break
        default:
            instance = new FillQuestion(obj?.title, obj?.answer, obj?.tag)
            instance.InputAnswer = obj?.inputAnswer
            break
    }

    instance.Id = obj?.id
    instance.ImageUrls = obj?.imageUrls
    instance.Score = obj?.score

    if (obj?.renderSequence && instance instanceof MultipleChoiceQuestion) {
        instance.RenderSequence = obj.renderSequence
    }

    return instance
}

export enum QuestionType {
    GENERIC, CHOICE, MULTI_CHOICE, FILL, TRUE_FALSE, OTHER,
}

export abstract class GenericQuestion {
    protected id: string
    protected type: QuestionType = QuestionType.GENERIC
    protected title: string
    protected answer: string
    protected inputAnswer: string
    protected tag: string
    protected imageUrls: string[]
    protected score: number

    private onUpdateInputAnswer: IUpdateListener<string> = null

    public get Id() {
        return this.id
    }

    public set Id(value) {
        this.id = value
    }

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

    public abstract TestCorrect(): boolean

    public set OnUpdateInputAnswer(listener: IUpdateListener<string>) {
        this.OnUpdateInputAnswer = listener
    }

    public get ImageUrls() {
        return this.imageUrls
    }

    public set ImageUrls(value) {
        this.imageUrls = value
    }

    public get Score() {
        return this.score
    }

    public set Score(value) {
        this.score = value
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
    protected inputChoiceIndices: number[] = []

    protected renderSequence: number[] = []

    public get RenderSequence() {
        return this.renderSequence
    }

    public set RenderSequence(value) {
        this.renderSequence = value
    }

    public randomizeRenderSequence() {
        this.renderSequence = this.renderSequence.sort(() => 0.5 - Math.random())
    }

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

    public TestCorrect(): boolean {
        if (this.inputChoiceIndices.length !== this.correctChoiceIndices.length) {
            return false
        }

        for (let item of this.inputChoiceIndices) {
            if (this.correctChoiceIndices.indexOf(item) === -1) {
                return false
            }
        }

        return true
    }

    public MatchedCount(): number {
        let matched = 0
        for (let item of this.inputChoiceIndices) {
            if (this.correctChoiceIndices.indexOf(item) > -1) {
                matched++
            }
        }

        return matched
    }

    public constructor(title: string, choices: string[], correctChoiceIndices: number[], tag: string = null) {
        super(title, "", tag)
        this.choices = choices
        this.correctChoiceIndices = correctChoiceIndices
        this.renderSequence = this.choices.map((_, index) => index)

        this.type = QuestionType.MULTI_CHOICE
    }
}

export class SingleChoiceQuestion extends MultipleChoiceQuestion {

    public get InputChoiceIndex(): number {
        if (!this.InputChoiceIndices || this.InputChoiceIndices.length === 0) {
            return null
        }

        return this.inputChoiceIndices[0]
    }

    public set InputChoiceIndex(value: number) {
        this.inputChoiceIndices = [value]
    }

    public get CorrectChoiceIndex(): number {
        if (!this.CorrectChoiceIndices || this.CorrectChoiceIndices.length === 0) {
            return null
        }

        return this.CorrectChoiceIndices[0]
    }

    public get InputChoiceIndices() {
        return this.inputChoiceIndices
    }

    public set InputChoiceIndices(value: number[]) {
        this.inputChoiceIndices = [value[0]]
    }

    public set InputAnswer(value: string) {
        super.InputAnswer = value ? value[0] : null
    }

    public constructor(title: string, choices: string[], correctChoiceIndex: number, tag: string = null) {
        super(title, choices, [correctChoiceIndex], tag)

        this.type = QuestionType.CHOICE
    }
}

export class FillQuestion extends GenericQuestion {
    public TestCorrect(): boolean {
        return this.inputAnswer?.trim() == this.answer?.trim()
    }

    public constructor(title: string, answer: string, tag: string = null) {
        super(title, answer, tag)

        this.type = QuestionType.FILL
    }
}

export class TrueFalseQuestion extends SingleChoiceQuestion {
    public TestCorrect(): boolean {
        return this.InputOption === this.CorrectOption
    }

    public get InputOption() {
        return this.InputChoiceIndex === 1 ? true : this.InputChoiceIndex === 0 ? false : this.InputChoiceIndex === null ? null : undefined
    }

    public set InputOption(value: boolean) {
        this.InputChoiceIndex = value === true ? 1 : value === false ? 0 : value
    }

    public get CorrectOption() {
        return this.CorrectChoiceIndex === 1 ? true : this.CorrectChoiceIndex === 0 ? false : this.CorrectChoiceIndex
    }

    public get TrueTitle() {
        return this.choices[1]
    }

    public get FalseTitle() {
        return this.choices[0]
    }

    public constructor(title: string, trueTitle: string = "", falseTitle: string = "", correctOption: boolean = undefined, tag: string = null) {
        super(title, [
            falseTitle,
            trueTitle,
        ], correctOption === true ? 1 : correctOption === false ? 0 : correctOption, tag)

        this.type = QuestionType.TRUE_FALSE
    }
}