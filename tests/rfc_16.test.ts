const runtime: any = global
import { runDangerfile } from "./utils"

beforeEach(() => {
  runtime.warn = jest.fn()
  runtime.danger = {}
  runtime.schedule = async (f: any) => await f()
})

afterEach(() => {
  runtime.warn = undefined
  runtime.danger = undefined
  runtime.schedule = undefined
})

const pr ={
  head: {
    user: {
      login: "danger"
    },
    repo: {
      name: "danger-js"
    }
  }
}

it("does nothing when there is no changelog file", () => {
  runtime.danger.github = {
    api: {
      repos: {
        getContent: jest.fn(() => [{ name: "README.md" }])
      }
    },
    pr
  }

  runtime.danger.git = {
    modified_files: [],
    created_files: []
  }

  runDangerfile("./org/all-prs.ts")
  
  expect(runtime.warn).not.toBeCalled()
})

it("does nothing when only `test` files were changed", () => {
  runtime.danger.github = {
    api: {
      repos: {
        getContent: jest.fn(() => [{ name: "changelog.md" }])
      }
    },
    pr
  }

  runtime.danger.git = {
    modified_files: ["tests/AuctionCalculatorSpec.scala"],
    created_files: []
  }
  runDangerfile("./org/all-prs.ts")
  expect(runtime.warn).not.toBeCalled()
})

it("does nothing when the changelog was changed", () => {
  runtime.danger.github = {
    api: {
      repos: {
        getContent: jest.fn(() => [{ name: "CHANGELOG.md" }])
      }
    },
    pr
  }
  
  runtime.danger.git = {
    modified_files: ["src/index.html", "CHANGELOG.md"],
    created_files: []
  }
  runDangerfile("./org/all-prs.ts")
  expect(runtime.warn).not.toBeCalled()
})

it("warns when code has changed but no changelog entry was made", async () => {
  // jest.useFakeTimers()

  runtime.danger.github = {
    api: {
      repos: {
        getContent: jest.fn(() => Promise.resolve([{ name: "CHANGELOG.md" }]))
      }
    },
    pr
  }

  runtime.danger.git = {
    modified_files: ["src/index.html"],
    created_files: []
  }

  console.log("before")
  runDangerfile("./org/all-prs.ts")
  console.log("after")

  expect(runtime.warn).toBeCalled()
})