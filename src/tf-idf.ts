/**
 * A class for calculating TF-IDF (Term Frequency-Inverse Document Frequency).
 */
export class TfIdf {
	/**
	 * Stores all documents, e.g., [['term1', 'term2'], ['term3']]
	 */
	private documents: string[][] = []
	/**
	 * Caches the IDF value for each term: Map<term, idfValue>
	 */
	private idfCache = new Map<string, number>()
	/**
	 * Caches the total number of terms in each document to avoid recalculation.
	 */
	private docTermCounts: number[] = []

	/**
	 * @param documents An array of documents, where each document is an array of terms (words).
	 */
	constructor(documents: string[][]) {
		if (!documents || documents.length === 0) {
			console.warn('TfIdfCalculator: Documents array is empty or invalid.')
			return
		}

		this.documents = documents
		this.documents.forEach((doc) => {
			this.docTermCounts.push(doc.length)
		})

		this.calculateAllIdf()
	}

	/**
	 * Calculates and caches the IDF values for all terms in the corpus.
	 */
	private calculateAllIdf(): void {
		const totalDocs = this.documents.length
		const docFrequency = new Map<string, number>()

		for (const doc of this.documents) {
			const uniqueTerms = new Set(doc)
			for (const term of uniqueTerms) {
				const count = docFrequency.get(term) || 0
				docFrequency.set(term, count + 1)
			}
		}

		for (const [term, freq] of docFrequency.entries()) {
			// The IDF formula is log((total docs / (docs containing term + 1)) + 1)
			// to prevent division by zero and ensure a baseline weight.
			const idf = Math.log(totalDocs / (freq + 1)) + 1
			this.idfCache.set(term, idf)
		}
	}

	/**
	 * Calculates the TF (Term Frequency) of a single term in a specific document.
	 * @param term The term to calculate.
	 * @param document The document where the term is located.
	 * @returns The TF score.
	 */
	private calculateTf(term: string, document: string[]): number {
		const totalTermsInDoc = document.length
		if (totalTermsInDoc === 0) {
			return 0
		}

		const termCount = document.filter((t) => t === term).length

		return termCount / totalTermsInDoc
	}

	/**
	 * Gets the TF-IDF score of a single term in a specified document.
	 * @param term The term to query.
	 * @param docIndex The index of the document in the initial array.
	 * @returns The TF-IDF score. Returns 0 if the term is not in the IDF cache (i.e., not in the corpus).
	 */
	public getTfIdf(term: string, docIndex: number): number {
		const document = this.documents[docIndex]
		if (!document) {
			console.error(`Document with index ${docIndex} not found.`)
			return 0
		}

		const tf = this.calculateTf(term, document)
		const idf = this.idfCache.get(term) || 0

		return tf * idf
	}

	/**
	 * Gets the TF-IDF scores for all unique terms in a specified document.
	 * @param docIndex The index of the document.
	 * @returns An object where keys are terms and values are their TF-IDF scores.
	 */
	public getDocumentScores(docIndex: number): Record<string, number> {
		const document = this.documents[docIndex]
		if (!document) {
			console.error(`Document with index ${docIndex} not found.`)
			return {}
		}

		const scores: Record<string, number> = {}
		const uniqueTerms = new Set(document)

		for (const term of uniqueTerms) {
			scores[term] = this.getTfIdf(term, docIndex)
		}

		return scores
	}

	/**
	 * Gets the top N keywords from a document based on TF-IDF scores.
	 * @param docIndex The index of the document.
	 * @param topN The number of top terms to return. Defaults to 5.
	 * @returns An array of [term, score] pairs, sorted in descending order of score.
	 */
	public getTopTerms(docIndex: number, topN = 5): [string, number][] {
		const scores = this.getDocumentScores(docIndex)

		const sortedTerms = Object.entries(scores).sort(
			([, scoreA], [, scoreB]) => scoreB - scoreA,
		)

		return sortedTerms.slice(0, topN)
	}

	/**
	 * Gets the TF-IDF scores for all documents.
	 * @returns An array of score objects, one for each document.
	 */
	public getAllScores(): Record<string, number>[] {
		return this.documents.map((_, index) => this.getDocumentScores(index))
	}
}
