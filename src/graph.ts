export class Graph<T> {
	private nodes: Map<T, Map<T, number>> = new Map() // from -> to -> weight

	public addNode(node: T): void {
		if (!this.nodes.has(node)) {
			this.nodes.set(node, new Map())
		}
	}

	public addEdge(from: T, to: T, weight: number = 1): void {
		this.addNode(from)
		this.addNode(to)
		const currentWeight = this.nodes.get(from)!.get(to) || 0
		this.nodes.get(from)!.set(to, currentWeight + weight)
	}

	public getNodes(): T[] {
		return Array.from(this.nodes.keys())
	}

	public getOutNeighbors(node: T): Map<T, number> {
		return this.nodes.get(node) || new Map()
	}

	public getInNeighbors(node: T): Map<T, number> {
		const inNeighbors = new Map<T, number>()
		for (const [from, neighbors] of this.nodes.entries()) {
			if (neighbors.has(node)) {
				inNeighbors.set(from, neighbors.get(node)!)
			}
		}
		return inNeighbors
	}

	public getTotalOutWeight(node: T): number {
		const neighbors = this.getOutNeighbors(node)
		return Array.from(neighbors.values()).reduce((sum, w) => sum + w, 0)
	}

	public clear(): void {
		this.nodes.clear()
	}
}
