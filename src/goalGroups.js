// ANDで連なる目標を、結合の弱いORで区切る。
export function goalGroups(goals) {
    const groups = [];
    for (const goal of goals) {
        if (!groups.length || goal.join === 'or') groups.push([]);
        groups.at(-1).push(goal);
    }
    return groups;
}
