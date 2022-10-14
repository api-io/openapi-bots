"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportIssues = exports.bundleFiles = exports.OpenApiBundleProbot = void 0;
var openapi_core_1 = require("@redocly/openapi-core");
var process_1 = require("process");
var yaml = __importStar(require("js-yaml"));
var OpenApiBundleProbot = function (app) {
    app.on('push', function (context) { return __awaiter(void 0, void 0, void 0, function () {
        var push, repo, owner, octokit, ref, compare, files;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    push = context.payload;
                    repo = push.repository.name;
                    owner = push.sender.login;
                    octokit = context.octokit;
                    ref = push.ref;
                    return [4 /*yield*/, octokit.repos.compareCommits(context.repo({ base: push.before, head: push.after }))];
                case 1:
                    compare = _b.sent();
                    files = (_a = compare.data.files) === null || _a === void 0 ? void 0 : _a.filter(function (a) {
                        return a.filename.endsWith('.openapi');
                    });
                    if (!files)
                        return [2 /*return*/, 'no changes'];
                    files.map(function (x) { return x.raw_url; });
                    return [4 /*yield*/, bundleFiles({ octokit: octokit, repo: repo, owner: owner, ref: ref, files: files })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, 'ok'];
            }
        });
    }); });
};
exports.OpenApiBundleProbot = OpenApiBundleProbot;
/*
const groupByFiles = (problems : NormalizedProblem[]) => {
  const fileGroups: any = {};
  for (const problem of problems) {
    const absoluteRef = problem.location[0].source.absoluteRef; // TODO: multiple errors
    fileGroups[absoluteRef] = fileGroups[absoluteRef] || {
      fileProblems: [],
      ruleIdPad: 0,
      locationPad: 0
    };
    const mappedProblem = Object.assign(Object.assign({}, problem), {location: problem.location.map(getLineColLocation)});
    fileGroups[absoluteRef].fileProblems.push(mappedProblem);
    fileGroups[absoluteRef].ruleIdPad = Math.max(problem.ruleId.length, fileGroups[absoluteRef].ruleIdPad);
    fileGroups[absoluteRef].locationPad = Math.max(Math.max(... mappedProblem.location.map((loc) => `${
      loc.start.line
    }:${
      loc.start.col
    }`.length)), fileGroups[absoluteRef].locationPad);
  }
  return fileGroups;
};
*/
// function generateAnnotations(problems: NormalizedProblem[]) :  {
// return problems.map(finding=> {
//     const line= getLineColLocation(finding.location[0]);
//     return
// {
//     path: finding.from?.source,
//     start_line: line.start.line,
//     end_line: line.end.line,
//     title: `${
//       finding.ruleId
//     } - ${
//       location.pointer
//     }`,
//     message: finding.message,
//     annotation_level: finding.severity === 'error'
//       ? 'failure'
//       : finding.severity == 'warn'
//         ? 'warning'
//         : 'notice'
// }});
// }
function generateSummary(problems) {
    var messages = [];
    if (problems.filter(function (a) { return a.severity == 'error'; }).length > 0) {
        messages.push("".concat(problems.filter(function (a) { return a.severity == 'error'; }).length, " failure(s) found"));
    }
    if (problems.filter(function (a) { return a.severity == 'warn'; }).length > 0) {
        messages.push("".concat(problems.filter(function (a) { return a.severity == 'warn'; }).length, " warn(s) found"));
    }
    return messages.join('\n');
}
function bundleFiles(_a) {
    var e_1, _b;
    var octokit = _a.octokit, repo = _a.repo, owner = _a.owner, ref = _a.ref, files = _a.files;
    return __awaiter(this, void 0, void 0, function () {
        var config, branch, reference, bundleStream, bundleStream_1, bundleStream_1_1, bundled, e_1_1;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, openapi_core_1.loadConfig)({ configPath: '.redocly.yaml' })];
                case 1:
                    config = _c.sent();
                    branch = "api-bundle-".concat(Math.floor(Math.random() * 9999));
                    return [4 /*yield*/, octokit.git.getRef({
                            repo: repo,
                            owner: owner,
                            ref: ref,
                        })
                        // Create a branch
                    ];
                case 2:
                    reference = _c.sent();
                    // Create a branch
                    return [4 /*yield*/, octokit.git.createRef({
                            repo: repo,
                            owner: owner,
                            ref: "refs/heads/".concat(branch),
                            sha: reference.data.object.sha, // accesses the sha from the heads/master reference we got
                        })];
                case 3:
                    // Create a branch
                    _c.sent();
                    bundleStream = files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [__assign({}, file)];
                                    _b = {};
                                    return [4 /*yield*/, (0, openapi_core_1.bundle)({ ref: file.raw_url, config: config })];
                                case 1: return [2 /*return*/, __assign.apply(void 0, _a.concat([(_b.bundle = _c.sent(), _b)]))];
                            }
                        });
                    }); });
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 12, 13, 18]);
                    bundleStream_1 = __asyncValues(bundleStream);
                    _c.label = 5;
                case 5: return [4 /*yield*/, bundleStream_1.next()];
                case 6:
                    if (!(bundleStream_1_1 = _c.sent(), !bundleStream_1_1.done)) return [3 /*break*/, 11];
                    bundled = bundleStream_1_1.value;
                    if (!bundled.bundle.problems) return [3 /*break*/, 8];
                    return [4 /*yield*/, reportIssues(octokit, owner, repo, ref, bundled)];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8: 
                // update bundle
                return [4 /*yield*/, octokit.repos.createOrUpdateFileContents({
                        repo: repo,
                        owner: owner,
                        path: bundled.filename,
                        message: "update bundled ".concat(bundled.filename),
                        content: Buffer.from(yaml.dump(bundled.bundle.bundle.parsed)).toString('base64'),
                        branch: branch,
                    })];
                case 9:
                    // update bundle
                    _c.sent();
                    _c.label = 10;
                case 10: return [3 /*break*/, 5];
                case 11: return [3 /*break*/, 18];
                case 12:
                    e_1_1 = _c.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 18];
                case 13:
                    _c.trys.push([13, , 16, 17]);
                    if (!(bundleStream_1_1 && !bundleStream_1_1.done && (_b = bundleStream_1.return))) return [3 /*break*/, 15];
                    return [4 /*yield*/, _b.call(bundleStream_1)];
                case 14:
                    _c.sent();
                    _c.label = 15;
                case 15: return [3 /*break*/, 17];
                case 16:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 17: return [7 /*endfinally*/];
                case 18: return [4 /*yield*/, octokit.pulls.create({
                        repo: repo,
                        owner: owner,
                        title: 'API Bundling',
                        head: branch,
                        base: ref,
                        body: 'API bundling!',
                        maintainer_can_modify: true,
                    })];
                case 19:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.bundleFiles = bundleFiles;
function reportIssues(octokit, owner, repo, ref, bundled) {
    return __awaiter(this, void 0, void 0, function () {
        var data, checkRunId, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, octokit.checks.create({
                        owner: owner,
                        repo: repo,
                        name: process_1.title,
                        head_sha: ref,
                        status: 'in_progress',
                        started_at: new Date(),
                    })];
                case 1:
                    data = _b.sent();
                    checkRunId = data.data.id;
                    console.log("Check Run Id - ".concat(checkRunId));
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, octokit.checks.update({
                            owner: owner,
                            repo: repo,
                            name: data.data.name,
                            check_run_id: checkRunId,
                            status: 'completed',
                            completed_at: new Date(),
                            conclusion: 'failure',
                            output: {
                                title: process_1.title,
                                summary: generateSummary(bundled.bundle.problems),
                                annotations: bundled.bundle.problems,
                            },
                        })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    console.log('Unable to post annotation batch');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.reportIssues = reportIssues;
exports.default = exports.OpenApiBundleProbot;
//# sourceMappingURL=bundle.js.map