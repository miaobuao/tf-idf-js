import { KeywordExtractor } from './keyword-extractor'
import {
	GetKeywordsOptions,
	KeywordExtractorOptions,
	WordWithScore,
} from './types'

export function getKeywords(
	documents: string | string[],
	options: KeywordExtractorOptions & GetKeywordsOptions = {},
): WordWithScore[][] {
	const extractor = new KeywordExtractor(documents, options)
	return extractor.getKeywords(options)
}
