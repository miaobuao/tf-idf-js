export interface WordWithScore {
	word: string
	score: number
}

export type Tokenizer = (text: string) => string[]

export interface TextRankOptions {
	damping?: number
	maxIter?: number
	minDiff?: number
	windowSize?: number
}

export interface KeywordExtractorOptions {
	tokenizer?: Tokenizer
	stopwords?: Set<string>
	useStopwords?: boolean
}

export interface GetKeywordsOptions {
	topN?: number
	textRankOptions?: TextRankOptions
}
