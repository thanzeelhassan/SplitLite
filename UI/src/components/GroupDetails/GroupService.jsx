const baseUrl = import.meta.env.VITE_API_URL;

class GroupService {
  static async fetchMembers(groupId, token) {
    const response = await fetch(`${baseUrl}/groups/${groupId}/members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch members");
    const data = await response.json();
    return data.members;
  }

  static async fetchExpenses(groupId, token) {
    const response = await fetch(`${baseUrl}/groups/${groupId}/expenses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch expenses");
    const data = await response.json();
    return data.expenses;
  }

  static async fetchSettlements(groupId, token) {
    const response = await fetch(`${baseUrl}/groups/${groupId}/settlements`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch settlements");
    const data = await response.json();
    return data.settlements;
  }

  static async getUserIdByEmail(email, token) {
    const response = await fetch(`${baseUrl}/users/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Failed to fetch user ID");
    const data = await response.json();
    return data.user.user_id;
  }

  static async addMember(groupId, userId, token) {
    const response = await fetch(`${baseUrl}/groupmembers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ group_id: groupId, user_id: userId }),
    });
    if (!response.ok) throw new Error("Failed to add member");
  }

  static async addExpense(groupId, expenseDetails, token) {
    const response = await fetch(`${baseUrl}/expense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ group_id: groupId, ...expenseDetails }),
    });
    if (!response.ok) throw new Error("Failed to add expense");
  }

  static async addSettlement(groupId, settlementDetails, token) {
    const response = await fetch(`${baseUrl}/settlement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ group_id: groupId, ...settlementDetails }),
    });
    if (!response.ok) throw new Error("Failed to add settlement");
  }

  static async fetchExpenseParticipants(groupId, token) {
    const response = await fetch(
      `${baseUrl}/groups/${groupId}/expenseparticipants`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch expense participants");
    const data = await response.json();
    return data.expenseparticipants;
  }

  static async fetchExpensesWithParticipants(groupId, token) {
    // Fetch expenses and participants in parallel
    const [expenses, expenseParticipants] = await Promise.all([
      this.fetchExpenses(groupId, token),
      this.fetchExpenseParticipants(groupId, token),
    ]);

    // Map participants to their respective expenses
    const expensesWithParticipants = expenses.map((expense) => ({
      ...expense,
      participants: expenseParticipants.filter(
        (participant) => participant.expense_id === expense.expense_id
      ),
    }));

    return expensesWithParticipants;
  }
}

export default GroupService;
