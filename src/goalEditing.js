export function removeGoal(goals, index) {
    const startsAlternative = goals[index].join === 'or';
    goals.splice(index, 1);
    if (startsAlternative && index > 0 && goals[index]) goals[index].join = 'or';
    if (goals.length) delete goals[0].join;
}
