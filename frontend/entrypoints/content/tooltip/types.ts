export interface TargetFragment {
    isTarget: boolean;
    textnode: Text;
    isFinancial?: boolean;
}

export interface TargetNode {
    parent: Node;
    originalText: Text;
    fragments: Array<TargetFragment>;
    count: number;
}