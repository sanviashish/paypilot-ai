from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from collections import defaultdict
from datetime import datetime
import json
import uuid
import threading
import time


app = FastAPI(
    title="PayPilot API",
    description="Autonomous AI teammate for Paytm merchants",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# DATA
# ---------------------------------------------------------

DATA_FILE = Path(__file__).parent / "data" / "transactions.json"


def load_transactions():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


# ---------------------------------------------------------
# AGENT STATE
# ---------------------------------------------------------

agent_state = {
    "status": "idle",
    "current_task": None,
    "activity_log": [],
    "campaign": None
}

agent_lock = threading.Lock()


def add_activity(action, message, status="completed"):

    with agent_lock:

        agent_state["activity_log"].append({
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "message": message,
            "status": status
        })


# ---------------------------------------------------------
# BUSINESS ANALYSIS
# ---------------------------------------------------------

def analyze_business(transactions):

    previous_transactions = [
        transaction
        for transaction in transactions
        if transaction["date"] <= "2026-09-18"
    ]

    recent_transactions = [
        transaction
        for transaction in transactions
        if transaction["date"] >= "2026-09-22"
    ]

    previous_revenue = sum(
        transaction["amount"]
        for transaction in previous_transactions
    )

    recent_revenue = sum(
        transaction["amount"]
        for transaction in recent_transactions
    )

    revenue_change = (
        (
            (recent_revenue - previous_revenue)
            / previous_revenue
        ) * 100
        if previous_revenue
        else 0
    )

    # ---------------------------------------------------------
    # EVENING ANALYSIS
    # ---------------------------------------------------------

    previous_evening = [
        transaction
        for transaction in previous_transactions
        if "17:00" <= transaction["time"] <= "20:59"
    ]

    recent_evening = [
        transaction
        for transaction in recent_transactions
        if "17:00" <= transaction["time"] <= "20:59"
    ]

    previous_evening_revenue = sum(
        transaction["amount"]
        for transaction in previous_evening
    )

    recent_evening_revenue = sum(
        transaction["amount"]
        for transaction in recent_evening
    )

    evening_change = (
        (
            (recent_evening_revenue - previous_evening_revenue)
            / previous_evening_revenue
        ) * 100
        if previous_evening_revenue
        else 0
    )

    # ---------------------------------------------------------
    # PRODUCT ANALYSIS
    # ---------------------------------------------------------

    previous_product_revenue = defaultdict(int)
    recent_product_revenue = defaultdict(int)

    for transaction in previous_transactions:

        previous_product_revenue[
            transaction["product"]
        ] += transaction["amount"]

    for transaction in recent_transactions:

        recent_product_revenue[
            transaction["product"]
        ] += transaction["amount"]

    all_products = (
        set(previous_product_revenue)
        | set(recent_product_revenue)
    )

    product_changes = []

    for product in all_products:

        previous_value = previous_product_revenue.get(
            product,
            0
        )

        recent_value = recent_product_revenue.get(
            product,
            0
        )

        if previous_value:

            change = (
                (
                    recent_value - previous_value
                )
                / previous_value
            ) * 100

        else:

            change = 0

        product_changes.append({
            "product": product,
            "previous_revenue": previous_value,
            "recent_revenue": recent_value,
            "change_percent": round(change, 1)
        })

    most_affected_product = (
        min(
            product_changes,
            key=lambda product: product["change_percent"]
        )
        if product_changes
        else None
    )

    affected_product_change_percent = (
        most_affected_product["change_percent"]
        if most_affected_product
        else 0
    )

    # ---------------------------------------------------------
    # DETERMINE BUSINESS PROBLEM
    # ---------------------------------------------------------

    if evening_change < -10:

        problem = (
            "Evening sales have declined significantly."
        )

        recommended_action = (
            "Launch a targeted evening promotional "
            "campaign between 5 PM and 8 PM."
        )

    elif revenue_change < -10:

        problem = (
            "Overall merchant sales are declining."
        )

        recommended_action = (
            "Launch a customer re-engagement campaign."
        )

    else:

        problem = (
            "Sales are relatively stable."
        )

        recommended_action = (
            "Continue monitoring merchant performance."
        )

    return {
        "status": (
            "attention_required"
            if revenue_change < -10
            else "healthy"
        ),
        "previous_revenue": previous_revenue,
        "recent_revenue": recent_revenue,
        "revenue_change_percent": round(
            revenue_change,
            1
        ),
        "previous_evening_revenue": (
            previous_evening_revenue
        ),
        "recent_evening_revenue": (
            recent_evening_revenue
        ),
        "evening_change_percent": round(
            evening_change,
            1
        ),
        "affected_product": (
            most_affected_product["product"]
            if most_affected_product
            else "Unknown"
        ),
        "affected_product_change_percent": round(
            affected_product_change_percent,
            1
        ),
        "product_analysis": product_changes,
        "problem": problem,
        "recommended_action": recommended_action
    }


# ---------------------------------------------------------
# AUTONOMOUS AI AGENT
# ---------------------------------------------------------

def run_agent():

    # Reset state

    with agent_lock:

        agent_state["activity_log"] = []
        agent_state["campaign"] = None

        agent_state["status"] = "observing"

        agent_state["current_task"] = (
            "Observing merchant transaction activity"
        )

    # ---------------------------------------------------------
    # STEP 1 — OBSERVE
    # ---------------------------------------------------------

    add_activity(
        "OBSERVE",
        "Agent collected recent merchant transaction data."
    )

    time.sleep(2)

    # ---------------------------------------------------------
    # STEP 2 — ANALYZE
    # ---------------------------------------------------------

    with agent_lock:

        agent_state["status"] = "analyzing"

        agent_state["current_task"] = (
            "Analyzing sales patterns and customer activity"
        )

    transactions = load_transactions()

    analysis = analyze_business(transactions)

    add_activity(
        "ANALYZE",
        f"Detected: {analysis['problem']}"
    )

    time.sleep(2)

    # ---------------------------------------------------------
    # STEP 3 — DECIDE
    # ---------------------------------------------------------

    with agent_lock:

        agent_state["status"] = "deciding"

        agent_state["current_task"] = (
            "Selecting the most suitable business action"
        )

    time.sleep(1.5)

    # ---------------------------------------------------------
    # AGENT DECISION
    # ---------------------------------------------------------

    if analysis["evening_change_percent"] < -10:

        campaign = {
            "id": f"CMP-{str(uuid.uuid4())[:8].upper()}",

            "type": (
                "Evening Re-engagement Campaign"
            ),

            "objective": (
                "Recover declining evening sales"
            ),

            "target_segment": (
                "Customers active during evening hours"
            ),

            "target_time": "5:00 PM - 8:00 PM",

            "affected_product": (
                analysis["affected_product"]
            ),

            "offer": "15% OFF on evening orders",

            "message": (
                "Your evening cravings deserve a little "
                "extra! Get 15% OFF on your next order "
                "between 5 PM and 8 PM."
            ),

            "channel": "SMS / WhatsApp",

            "status": "awaiting_approval",

            "expected_impact": (
                "Increase evening transaction volume"
            ),

            "created_at": datetime.now().isoformat()
        }

    else:

        campaign = {
            "id": f"CMP-{str(uuid.uuid4())[:8].upper()}",

            "type": (
                "Customer Re-engagement Campaign"
            ),

            "objective": (
                "Improve merchant sales"
            ),

            "target_segment": "Recent customers",

            "target_time": "Business hours",

            "affected_product": (
                analysis["affected_product"]
            ),

            "offer": "10% OFF on next purchase",

            "message": (
                "We'd love to serve you again! "
                "Enjoy 10% OFF on your next order."
            ),

            "channel": "SMS / WhatsApp",

            "status": "awaiting_approval",

            "expected_impact": (
                "Increase repeat purchases"
            ),

            "created_at": datetime.now().isoformat()
        }

    # ---------------------------------------------------------
    # WAIT FOR APPROVAL
    # ---------------------------------------------------------

    with agent_lock:

        agent_state["campaign"] = campaign

        agent_state["status"] = "waiting_for_approval"

        agent_state["current_task"] = (
            "Waiting for merchant approval"
        )

    add_activity(
        "DECIDE",
        (
            f"Created campaign recommendation: "
            f"{campaign['type']}"
        )
    )

    add_activity(
        "APPROVAL",
        "Campaign is waiting for merchant approval.",
        "waiting"
    )


# ---------------------------------------------------------
# CAMPAIGN EXECUTION
# ---------------------------------------------------------

def execute_campaign():

    with agent_lock:
        campaign = agent_state["campaign"]

    # ---------------------------------------------------------
    # VALIDATION
    # ---------------------------------------------------------

    if not campaign:

        return {
            "success": False,
            "message": "No campaign is available."
        }

    if campaign["status"] != "approved":

        return {
            "success": False,
            "message": (
                "Campaign must be approved "
                "before execution."
            )
        }

    # ---------------------------------------------------------
    # START EXECUTION
    # ---------------------------------------------------------

    with agent_lock:

        campaign["status"] = "executing"

        agent_state["status"] = "executing"

        agent_state["current_task"] = (
            "Starting campaign execution workflow"
        )

    add_activity(
        "EXECUTE",
        "n8n workflow triggered for approved campaign.",
        "running"
    )

    time.sleep(1)

    # ---------------------------------------------------------
    # WORKFLOW STEP 1 — AUDIENCE
    # ---------------------------------------------------------

    with agent_lock:

        agent_state["current_task"] = (
            "Identifying eligible customers"
        )

    add_activity(
        "WORKFLOW",
        (
            "Identifying customers matching "
            "the campaign segment."
        ),
        "running"
    )

    time.sleep(1.5)

    # ---------------------------------------------------------
    # WORKFLOW STEP 2 — MESSAGE
    # ---------------------------------------------------------

    with agent_lock:

        agent_state["current_task"] = (
            "Generating personalized campaign message"
        )

    add_activity(
        "WORKFLOW",
        (
            "Campaign message prepared for "
            "SMS / WhatsApp delivery."
        ),
        "running"
    )

    time.sleep(1.5)

    # ---------------------------------------------------------
    # WORKFLOW STEP 3 — SEND
    # ---------------------------------------------------------

    with agent_lock:

        agent_state["current_task"] = (
            "Sending campaign to customers"
        )

    add_activity(
        "SEND",
        (
            "Campaign messages sent to "
            "eligible customers."
        ),
        "running"
    )

    time.sleep(2)

    # ---------------------------------------------------------
    # WORKFLOW STEP 4 — COMPLETE
    # ---------------------------------------------------------

    with agent_lock:

        campaign["status"] = "executed"

        campaign["executed_at"] = (
            datetime.now().isoformat()
        )

        agent_state["status"] = "executed"

        agent_state["current_task"] = (
            "Campaign executed successfully"
        )

    add_activity(
        "EXECUTE",
        (
            f"Campaign {campaign['id']} "
            "was executed successfully."
        )
    )

    time.sleep(1)

    # ---------------------------------------------------------
    # WORKFLOW STEP 5 — MEASURE
    # ---------------------------------------------------------

    add_activity(
        "MEASURE",
        "Campaign monitoring has started.",
        "monitoring"
    )

    return {
        "success": True,
        "message": "Campaign executed successfully.",
        "campaign": campaign
    }


# ---------------------------------------------------------
# BASIC ROUTES
# ---------------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "PayPilot backend is running"
    }


@app.get("/api/transactions")
def get_transactions():

    return load_transactions()


@app.get("/api/business-analysis")
def get_business_analysis():

    transactions = load_transactions()

    return analyze_business(transactions)


# ---------------------------------------------------------
# START INVESTIGATION
# ---------------------------------------------------------

@app.post("/api/agent/investigate")
def investigate():

    with agent_lock:

        if agent_state["status"] in [
            "observing",
            "analyzing",
            "deciding",
            "executing"
        ]:

            return {
                "success": False,
                "message": "Agent is already working."
            }

    agent_thread = threading.Thread(
        target=run_agent,
        daemon=True
    )

    agent_thread.start()

    return {
        "success": True,
        "message": "AI investigation started.",
        "agent_status": "observing"
    }


# ---------------------------------------------------------
# AGENT STATUS
# ---------------------------------------------------------

@app.get("/api/agent/status")
def get_agent_status():

    with agent_lock:

        return {
            "status": agent_state["status"],
            "current_task": agent_state["current_task"],
            "campaign": agent_state["campaign"],
            "activity_log": agent_state["activity_log"]
        }


# ---------------------------------------------------------
# APPROVE CAMPAIGN
# ---------------------------------------------------------

@app.post("/api/agent/approve")
def approve_campaign():

    with agent_lock:

        campaign = agent_state["campaign"]

    # ---------------------------------------------------------
    # VALIDATION
    # ---------------------------------------------------------

    if not campaign:

        return {
            "success": False,
            "message": (
                "No campaign is awaiting approval."
            )
        }

    if campaign["status"] != "awaiting_approval":

        return {
            "success": False,
            "message": (
                "Campaign is not awaiting approval."
            )
        }

    # ---------------------------------------------------------
    # APPROVE
    # ---------------------------------------------------------

    with agent_lock:

        campaign["status"] = "approved"

        agent_state["status"] = "approved"

        agent_state["current_task"] = (
            "Campaign approved and ready for execution"
        )

    add_activity(
        "APPROVAL",
        (
            f"Merchant approved campaign "
            f"{campaign['id']}."
        )
    )

    return {
        "success": True,
        "message": "Campaign approved.",
        "campaign": campaign
    }


# ---------------------------------------------------------
# EXECUTE CAMPAIGN
# ---------------------------------------------------------

@app.post("/api/agent/execute")
def execute():

    return execute_campaign()


# ---------------------------------------------------------
# BUSINESS SIMULATION
# ---------------------------------------------------------

@app.post("/api/simulation/transaction")
def simulate_transaction():

    transactions = load_transactions()

    # ---------------------------------------------------------
    # CREATE SIMULATED TRANSACTION
    # ---------------------------------------------------------

    new_transaction = {

        "id": (
            f"TXN-{str(uuid.uuid4())[:8].upper()}"
        ),

        "date": datetime.now().strftime(
            "%Y-%m-%d"
        ),

        "time": datetime.now().strftime(
            "%H:%M"
        ),

        "product": "Cold Coffee",

        "amount": 120,

        "payment_method": "Paytm"
    }

    transactions.append(new_transaction)

    # ---------------------------------------------------------
    # SAVE TRANSACTION
    # ---------------------------------------------------------

    with open(
        DATA_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            transactions,
            file,
            indent=4
        )

    return {

        "success": True,

        "message": (
            "Simulated transaction added."
        ),

        "transaction": new_transaction
    }