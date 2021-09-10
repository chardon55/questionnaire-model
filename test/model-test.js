const assert = require('assert')
const { TrueFalseQuestion, FillQuestion, SingleChoiceQuestion, MultipleChoiceQuestion } = require("../dist/main")

describe('Model test', function () {
    this.timeout(0)

    describe("True-false", function () {

        const trueTitle = "Set1"
        const falseTitle = "Set2"

        const expectedInput = false

        const expected1 = true
        const expected2 = false
        const expected3 = null
        const expected4 = undefined

        describe("True-answer", function () {
            const obj1 = new TrueFalseQuestion("Test1", trueTitle, falseTitle, expected1)
            obj1.InputOption = expectedInput

            it('True title', function () {
                assert.strictEqual(obj1.TrueTitle, trueTitle)
            })

            it('False title', function () {
                assert.strictEqual(obj1.FalseTitle, falseTitle)
            })

            it('Input value', function () {
                assert.strictEqual(obj1.InputOption, expectedInput)
            })

            it('Get value', function () {
                assert.strictEqual(obj1.CorrectOption, expected1)
            })

            it('Test correction', function () {
                assert.strictEqual(obj1.TestCorrect(), expected1 === expectedInput)
            })
        })

        describe("False answer", function () {
            const obj2 = new TrueFalseQuestion("Test2", trueTitle, falseTitle, expected2)
            obj2.InputOption = expectedInput

            it('Get value', function () {
                assert.strictEqual(obj2.CorrectOption, expected2)
            })

            it("Test correction", function () {
                assert.strictEqual(obj2.TestCorrect(), expected2 === expectedInput)
            })
        })

        describe("Null answer", function () {
            const obj3 = new TrueFalseQuestion("Test3", trueTitle, falseTitle, expected3)
            obj3.InputOption = expectedInput

            it('Get value', function () {
                assert.strictEqual(obj3.CorrectOption, expected3)
            })

            it("Test correction", function () {
                assert.strictEqual(obj3.TestCorrect(), false)
            })
        })

        describe("Undefined answer", function () {
            const obj4 = new TrueFalseQuestion("Test4", trueTitle, falseTitle, expected4)
            obj4.InputOption = expectedInput

            it('Get value', function () {
                assert.strictEqual(obj4.CorrectOption, expected4)
            })

            it("Test correction", function () {
                assert.strictEqual(obj4.TestCorrect(), false)
            })
        })

        describe("No input (Undefined answer)", function () {
            const obj5 = new TrueFalseQuestion("Test4", trueTitle, falseTitle, expected4)

            it('Get value', function () {
                assert.strictEqual(obj5.CorrectOption, expected4)
            })
        })

        describe("No input", function () {
            const obj6 = new TrueFalseQuestion("Test4", trueTitle, falseTitle, expected1)

            it('Get value of obj6', function () {
                assert.strictEqual(obj6.CorrectOption, expected1)
            })

            it("Test correction", function () {
                assert.strictEqual(obj6.TestCorrect(), false)
            })
        })
    })

    describe("Fill", function () {

        const expected1 = "Go for a trip."
        const wrongAnswer = "Go to a trip."

        describe("Value storage", function () {
            const obj = new FillQuestion("TestVS", expected1)

            it("Get value", function () {
                assert.strictEqual(obj.Answer, expected1)
            })

            obj.InputAnswer = wrongAnswer
            it("Get value (inserted input answer)", function () {
                assert.strictEqual(obj.InputAnswer, wrongAnswer)
                assert.strictEqual(obj.Answer, expected1)
            })
        })

        describe("Test correction", function () {
            const obj1 = new FillQuestion("Test1", expected1)

            it("No input", function () {
                assert.strictEqual(obj1.TestCorrect(), false)
            })

            it("Correct input", function () {
                obj1.InputAnswer = expected1
                assert.strictEqual(obj1.TestCorrect(), true)
            })

            it("Incorrect input", function () {
                obj1.InputAnswer = wrongAnswer
                assert.strictEqual(obj1.TestCorrect(), false)
            })
        })
    })

    describe("Single choice", function () {

        const choices = [
            "AAA",
            "BBB",
            "CCC",
        ]

        const expected1 = 2
        const wrongInput = 1

        describe("Value storage", function () {
            const obj = new SingleChoiceQuestion("Test", choices, expected1)

            it("Choices storage", function () {
                const c = obj.Choices
                assert.doesNotThrow(() => {
                    c.length
                })

                assert.strictEqual(c.length, choices.length)

                for (let index in c) {
                    assert.strictEqual(c[index], choices[index])
                }
            })

            it("Answer stoage", function () {
                assert.strictEqual(obj.CorrectChoiceIndex, expected1)
            })

            obj.InputChoiceIndex = wrongInput

            it("Input answer", function () {
                assert.strictEqual(obj.InputChoiceIndex, wrongInput)
            })
        })

        describe("Test correction", function () {
            const obj = new SingleChoiceQuestion("Test", choices, expected1)

            it("No input", function () {
                assert.strictEqual(obj.TestCorrect(), false)
            })

            it("Correct input", function () {
                obj.InputChoiceIndex = expected1

                assert.strictEqual(obj.TestCorrect(), true)
            })

            it("Incorrect input", function () {
                obj.InputChoiceIndex = wrongInput

                assert.strictEqual(obj.TestCorrect(), false)
            })
        })
    })

    describe("Multiple choice", function () {
        const choices = [
            'AAA',
            'BBB',
            'CCC',
            'DDD',
            'EEE',
        ]

        const expected1 = [
            0, 2, 3,
        ]

        const wrong1WithSameLength = [
            2, 3, 4,
        ]

        const wrong1WithDifferentLength = [
            0, 1, 2, 3, 4,
        ]

        const partiallyCorrect1 = [
            0, 3,
        ]

        const expected2 = [
            1,
        ]

        const wrong2WithSameLength = [
            2,
        ]

        const wrong2WithDifferentLength = [
            0, 1, 2,
        ]

        describe("Value storage", function () {
            const obj = new MultipleChoiceQuestion("Test", choices, expected1)

            it("Choices", function () {
                const c = obj.Choices
                assert.doesNotThrow(() => {
                    c.length
                })

                assert.strictEqual(c.length, choices.length)

                for (let i in c) {
                    assert.strictEqual(c[i], choices[i])
                }
            })

            it("Answer", function () {
                const answer = obj.CorrectChoiceIndices
                assert.strictEqual(answer.length, expected1.length)

                for (let i in answer) {
                    assert.strictEqual(answer[i], expected1[i])
                }
            })

            it("Input answer", function () {
                obj.InputChoiceIndices = wrong1WithDifferentLength

                const answer = obj.InputChoiceIndices
                assert.strictEqual(answer.length, wrong1WithDifferentLength.length)

                for (let i in answer) {
                    assert.strictEqual(answer[i], wrong1WithDifferentLength[i])
                }
            })
        })

        describe("Real MC", function () {

            describe("Test correct", function () {
                const obj = new MultipleChoiceQuestion("Test", choices, expected1)

                it("No input", function () {
                    assert.strictEqual(obj.TestCorrect(), false)
                })

                it("Correct input", function () {
                    obj.InputChoiceIndices = expected1
                    assert.strictEqual(obj.TestCorrect(), true)
                })

                it("Incorrect input (Same length)", function () {
                    obj.InputChoiceIndices = wrong1WithSameLength
                    assert.strictEqual(obj.TestCorrect(), false)
                })

                it("Incorrect input (Different length)", function () {
                    obj.InputChoiceIndices = wrong1WithDifferentLength
                    assert.strictEqual(obj.TestCorrect(), false)
                })

                it("Partially correct", function () {
                    obj.InputChoiceIndices = partiallyCorrect1
                    assert.strictEqual(obj.TestCorrect(), false)
                })
            })

            describe("Matched count", function () {
                const obj = new MultipleChoiceQuestion("Test", choices, expected1)

                it("No input", function () {
                    assert.strictEqual(obj.MatchedCount(), 0)
                })

                it("Correct input", function () {
                    obj.InputChoiceIndices = expected1
                    assert.strictEqual(obj.MatchedCount(), expected1.length)
                })

                it("Incorrect input (Same length)", function () {
                    obj.InputChoiceIndices = wrong1WithSameLength
                    assert.strictEqual(obj.MatchedCount(), 2)
                })

                it("Incorrect input (Different length)", function () {
                    obj.InputChoiceIndices = wrong1WithDifferentLength
                    assert.strictEqual(obj.MatchedCount(), 3)
                })

                it("Partially correct", function () {
                    obj.InputChoiceIndices = partiallyCorrect1
                    assert.strictEqual(obj.MatchedCount(), 2)
                })
            })
        })

        describe("Fake MC", function () {
            describe("Test correct", function () {
                const obj = new MultipleChoiceQuestion("Test", choices, expected2)

                it("No input", function () {
                    assert.strictEqual(obj.TestCorrect(), false)
                })

                it("Correct input", function () {
                    obj.InputChoiceIndices = expected2
                    assert.strictEqual(obj.TestCorrect(), true)
                })

                it("Incorrect input (Same length)", function () {
                    obj.InputChoiceIndices = wrong2WithSameLength
                    assert.strictEqual(obj.TestCorrect(), false)
                })

                it("Incorrect input (Different length)", function () {
                    obj.InputChoiceIndices = wrong2WithDifferentLength
                    assert.strictEqual(obj.TestCorrect(), false)
                })
            })

            describe("Matched count", function () {
                const obj = new MultipleChoiceQuestion("Test", choices, expected2)

                it("No input", function () {
                    assert.strictEqual(obj.MatchedCount(), 0)
                })

                it("Correct input", function () {
                    obj.InputChoiceIndices = expected2
                    assert.strictEqual(obj.MatchedCount(), expected2.length)
                })

                it("Incorrect input (Same length)", function () {
                    obj.InputChoiceIndices = wrong2WithSameLength
                    assert.strictEqual(obj.MatchedCount(), 0)
                })

                it("Incorrect input (Different length)", function () {
                    obj.InputChoiceIndices = wrong2WithDifferentLength
                    assert.strictEqual(obj.MatchedCount(), 1)
                })
            })
        })
    })
})