import { Graph } from './graph'

interface TextRankOptions {
	damping?: number // Damping factor (usually 0.85)
	maxIter?: number // Maximum number of iterations
	minDiff?: number // Minimum difference for convergence
	windowSize?: number // Window size for co-occurrence
}

export class TextRank {
	private damping: number
	private maxIter: number
	private minDiff: number
	private windowSize: number
	private graph: Graph<string> = new Graph()
	private scores: Map<string, number> = new Map()

	constructor(options: TextRankOptions = {}) {
		this.damping = options.damping || 0.85
		this.maxIter = options.maxIter || 200
		this.minDiff = options.minDiff || 0.0001
		this.windowSize = options.windowSize || 5
	}

	private buildGraph(words: string[]): void {
		this.graph.clear()
		const uniqueWords = new Set(words)

		for (const word of uniqueWords) {
			this.graph.addNode(word)
		}

		for (let i = 0; i < words.length; i++) {
			const start = Math.max(0, i - this.windowSize)
			const end = Math.min(words.length, i + this.windowSize + 1)

			const windowSlice = words.slice(start, i).concat(words.slice(i + 1, end))
			const word1 = words[i]

			for (const word2 of windowSlice) {
				this.graph.addEdge(word1, word2, 1)
			}
		}
	}

	public run(words: string[], initialWeights?: Map<string, number>): void {
		this.buildGraph(words)

		// Initialize scores and priors
		this.scores.clear()
		const uniqueWords = this.graph.getNodes()
		const defaultInitialWeight = 1.0
		const priors = new Map<string, number>()
		let totalWeight = 0

		if (initialWeights) {
			for (const word of uniqueWords) {
				const weight = initialWeights.get(word) || defaultInitialWeight
				priors.set(word, weight)
				totalWeight += weight
			}
		} else {
			for (const word of uniqueWords) {
				priors.set(word, defaultInitialWeight)
			}
			totalWeight = uniqueWords.length
		}

		// Normalize priors
		if (totalWeight > 0) {
			for (const [word, weight] of priors.entries()) {
				priors.set(word, weight / totalWeight)
			}
		}

		for (const word of uniqueWords) {
			this.scores.set(word, priors.get(word) || 0)
		}

		// Iterative ranking
		for (let iter = 0; iter < this.maxIter; iter++) {
			const newScores = new Map<string, number>()
			let max_diff = 0

			for (const word of this.graph.getNodes()) {
				const prior = priors.get(word) || 0
				let rank = (1 - this.damping) * prior
				let inboundWeightSum = 0

				const inNeighbors = this.graph.getInNeighbors(word)
				for (const [potentialNeighbor, weight] of inNeighbors.entries()) {
					const neighborTotalOutboundWeight =
						this.graph.getTotalOutWeight(potentialNeighbor)
					if (neighborTotalOutboundWeight > 0) {
						inboundWeightSum +=
							(weight / neighborTotalOutboundWeight) *
							(this.scores.get(potentialNeighbor) || 0)
					}
				}

				newScores.set(word, rank + this.damping * inboundWeightSum)
				max_diff = Math.max(
					max_diff,
					Math.abs(newScores.get(word)! - (this.scores.get(word) || 0)),
				)
			}

			this.scores = newScores

			if (max_diff < this.minDiff) {
				break
			}
		}
	}

	public getTopKeywords(topN: number = 5): [string, number][] {
		return Array.from(this.scores.entries())
			.sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
			.slice(0, topN)
	}
}
