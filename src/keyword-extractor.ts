import { eng, removeStopwords, zho } from 'stopword'
import { TextRank } from './text-rank'
import { TfIdf } from './tf-idf'
import {
	GetKeywordsOptions,
	KeywordExtractorOptions,
	Tokenizer,
	WordWithScore,
} from './types'

const defaultTokenizer: Tokenizer = (text) => {
	const segmenter = new Intl.Segmenter(['zh-CN', 'en-US'], {
		granularity: 'word',
	})
	const segments = segmenter.segment(text)
	return Array.from(segments)
		.filter((segment) => segment.isWordLike)
		.map((segment) => segment.segment.toLowerCase())
}

const defaultStopwords = [...zho, ...eng]

export class KeywordExtractor {
	private readonly tokenizedDocs: string[][]
	private readonly tfidfModel?: TfIdf

	constructor(
		documents: string | string[],
		options: KeywordExtractorOptions = {},
	) {
		const {
			tokenizer = defaultTokenizer,
			stopwords,
			useStopwords = true,
		} = options

		const docs = Array.isArray(documents) ? documents : [documents]
		const finalStopwords = stopwords ? Array.from(stopwords) : defaultStopwords

		this.tokenizedDocs = docs.map((doc) => {
			const tokens = tokenizer(doc)
			if (useStopwords) {
				return removeStopwords(tokens, finalStopwords)
			}
			return tokens
		})

		if (this.tokenizedDocs.length > 1) {
			this.tfidfModel = new TfIdf(this.tokenizedDocs)
		}
	}

	public getKeywords(options: GetKeywordsOptions = {}): WordWithScore[][] {
		const { topN = 10, textRankOptions = {} } = options
		const results: WordWithScore[][] = []

		for (let i = 0; i < this.tokenizedDocs.length; i++) {
			const docTokens = this.tokenizedDocs[i]
			let initialWeights: Map<string, number> | undefined

			if (this.tfidfModel) {
				const tfidfScores = this.tfidfModel.getDocumentScores(i)
				initialWeights = new Map(Object.entries(tfidfScores))
			}

			const textRank = new TextRank(textRankOptions)
			textRank.run(docTokens, initialWeights)
			const keywords = textRank.getTopKeywords(topN)
			results.push(keywords.map(([word, score]) => ({ word, score })))
		}

		return results
	}

	public getTokenizedDocs(): string[][] {
		return this.tokenizedDocs
	}

	public getTfIdfModel(): TfIdf | undefined {
		return this.tfidfModel
	}
}
