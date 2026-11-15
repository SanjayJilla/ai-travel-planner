import os
import uuid
from datetime import datetime

import streamlit as st
from langchain_core.messages import HumanMessage
from langgraph.types import Command

from graph import app


# ── Page Config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AI Agentic Travel Planner",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom Styling ────────────────────────────────────────────────────────────
st.markdown(
    """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Hero Banner ── */
.hero-container {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2b48 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 2.2rem 2.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}
.hero-badge {
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #38bdf8;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.25rem 0.8rem;
    border-radius: 9999px;
    display: inline-block;
    margin-bottom: 0.8rem;
}
.hero-title {
    font-size: 2.4rem;
    font-weight: 800;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.02em;
}
.hero-desc {
    color: #94a3b8;
    font-size: 1rem;
    max-width: 680px;
    line-height: 1.5;
    margin: 0;
}

/* ── Feature Tags ── */
.tags-row {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1.2rem;
}
.tag-pill {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.25rem 0.7rem;
    border-radius: 8px;
}

/* ── Table Styling & Overlap Prevention ── */
table {
    width: 100% !important;
    display: block !important;
    overflow-x: auto !important;
    border-collapse: collapse !important;
    margin: 1.2rem 0 !important;
    background: #0f172a;
    border-radius: 8px;
}
th, td {
    padding: 10px 14px !important;
    font-size: 0.86rem !important;
    border: 1px solid #1e293b !important;
    text-align: left !important;
}
th {
    background-color: #1e293b !important;
    color: #38bdf8 !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    font-size: 0.78rem !important;
    letter-spacing: 0.05em;
}
td {
    color: #cbd5e1 !important;
}
tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.02) !important;
}

/* ── Content Cards ── */
.glass-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 14px;
    padding: 1.2rem 1.4rem;
    margin-bottom: 1.2rem;
}
.card-header {
    color: #38bdf8;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

/* ── HITL Banner ── */
.hitl-banner {
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(202, 138, 4, 0.05) 100%);
    border: 1px solid rgba(234, 179, 8, 0.35);
    border-radius: 16px;
    padding: 1.4rem 1.6rem;
    margin: 1.5rem 0;
}
.hitl-title {
    color: #facc15;
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.3rem;
}
</style>
""",
    unsafe_allow_html=True,
)

# ── Sidebar Session ───────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### ⚙️ Session & Storage")
    user_id = st.text_input("User ID", value="demo_traveler")

    if "thread_id" not in st.session_state:
        st.session_state.thread_id = f"{user_id}_{uuid.uuid4().hex[:6]}"

    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        if st.button("🔄 New Trip", use_container_width=True):
            st.session_state.thread_id = f"{user_id}_{uuid.uuid4().hex[:6]}"
            st.session_state.pop("waiting_for_approval", None)
            st.session_state.pop("latest_result", None)
            st.session_state.trip_query = ""
            st.rerun()

    st.caption(f"**Thread ID:** `{st.session_state.thread_id}`")

    st.markdown("---")
    st.markdown("### 🗄️ Storage Status")
    try:
        from config import DATABASE_URL
        if DATABASE_URL:
            st.success("💾 Checkpoints: **PostgreSQL / Memory**")
        else:
            st.info("🧠 Checkpoints: **In-Memory (RAM)**")
    except Exception:
        st.info("🧠 Checkpoints: **In-Memory**")

    st.caption("Active checkpoints preserve conversation turns across approval steps.")

# ── Hero Banner ───────────────────────────────────────────────────────────────
st.markdown(
    """
<div class="hero-container">
    <div class="hero-badge">Autonomous Multi-Agent System</div>
    <h1 class="hero-title">AI Itinerary & Travel Planner</h1>
    <p class="hero-desc">
        Powered by LangGraph Supervisor orchestration, real-time MCP tool servers, automated Input Guardrails, and interactive Human-in-the-Loop approval.
    </p>
    <div class="tags-row">
        <span class="tag-pill">🛡️ Input Guardrail</span>
        <span class="tag-pill">✈️ AviationStack MCP</span>
        <span class="tag-pill">🏨 Tavily Search MCP</span>
        <span class="tag-pill">⛅ OpenWeather MCP</span>
        <span class="tag-pill">💰 Budget Analyst</span>
        <span class="tag-pill">👤 Human-in-the-Loop</span>
    </div>
</div>
""",
    unsafe_allow_html=True,
)

# ── Quick Suggestions ─────────────────────────────────────────────────────────
st.markdown("##### 💡 Quick Suggestions")
quick_queries = [
    "🇯🇵 7-day Tokyo trip under ₹2 Lakhs with budget stays",
    "🇦🇪 4-day Dubai weekend getaway with luxury experiences",
    "🇮🇩 10-day Bali backpacking trip under $1,200",
]

if "trip_query" not in st.session_state:
    st.session_state.trip_query = ""

def set_quick_query(text: str):
    st.session_state.trip_query = text

q_cols = st.columns(len(quick_queries))
for i, col in enumerate(q_cols):
    with col:
        st.button(
            quick_queries[i],
            key=f"quick_{i}",
            on_click=set_quick_query,
            args=(quick_queries[i],),
            use_container_width=True,
        )

# ── Travel Input ──────────────────────────────────────────────────────────────
query = st.text_area(
    "Where would you like to travel?",
    key="trip_query",
    placeholder="e.g. Plan a complete 7-day Japan trip including flights, hotels, and sightseeing under ₹2 Lakhs.",
    height=100,
)

config = {"configurable": {"thread_id": st.session_state.thread_id}}

col_plan, _ = st.columns([1, 3])
with col_plan:
    plan_clicked = st.button("🚀 Generate Draft Itinerary", type="primary", use_container_width=True)

if plan_clicked:
    if not query.strip():
        st.warning("Please describe your trip first.")
    else:
        with st.spinner("🤖 Supervisor evaluating guardrails & orchestrating specialist agents..."):
            result = app.invoke(
                {
                    "messages": [HumanMessage(content=query)],
                    "user_id": user_id,
                    "user_query": query,
                    "flight_results": "",
                    "hotel_results": "",
                    "weather_results": "",
                    "budget_results": "",
                    "itinerary": "",
                    "final_response": "",
                    "llm_calls": 0,
                },
                config=config,
            )

        st.session_state.latest_result = result
        st.session_state.waiting_for_approval = "__interrupt__" in result
        st.rerun()

# ── Results Presentation ──────────────────────────────────────────────────────
result = st.session_state.get("latest_result")

if result:
    # 1. Guardrail Blocked
    if not result.get("selected_agents"):
        st.error("🛡️ **Request Blocked by Input Guardrail**")
        st.warning(
            result.get(
                "supervisor_reasoning",
                "This request was classified as off-topic or unsafe and will not be processed.",
            )
        )
    else:
        # 2. Supervisor Plan Overview
        st.markdown("### 📋 Supervisor Agent Plan")
        with st.expander("🔍 View Supervisor Routing & Constraints", expanded=True):
            st.markdown(f"**Reasoning:** {result.get('supervisor_reasoning', 'N/A')}")
            agents = result.get("selected_agents", [])
            badges = " ".join([f"`{a}`" for a in agents])
            st.markdown(f"**Dispatched Specialist Agents:** {badges}")
            constraints = result.get("trip_constraints", {})
            if constraints:
                st.json(constraints)

        # 3. Specialist Results in Clean Full-Width Tabs (Zero Table Overlap)
        st.markdown("### 🔍 Specialist Findings")
        tab_titles = []
        if result.get("flight_results"):
            tab_titles.append("✈️ Flight Guidance")
        if result.get("hotel_results"):
            tab_titles.append("🏨 Hotel Research")
        if result.get("weather_results"):
            tab_titles.append("⛅ Weather & Forecast")
        if result.get("budget_results"):
            tab_titles.append("💰 Budget Assessment")

        if tab_titles:
            tabs = st.tabs(tab_titles)
            tab_idx = 0
            if result.get("flight_results"):
                with tabs[tab_idx]:
                    st.markdown(result.get("flight_results"))
                tab_idx += 1
            if result.get("hotel_results"):
                with tabs[tab_idx]:
                    st.markdown(result.get("hotel_results"))
                tab_idx += 1
            if result.get("weather_results"):
                with tabs[tab_idx]:
                    st.markdown(result.get("weather_results"))
                tab_idx += 1
            if result.get("budget_results"):
                with tabs[tab_idx]:
                    st.markdown(result.get("budget_results"))
                tab_idx += 1

        # 4. Draft Itinerary Display
        st.markdown("---")
        st.markdown("### 🗓️ Draft Travel Plan (Pre-Approval)")
        if "__interrupt__" in result:
            draft = result["__interrupt__"][0].value.get("draft_itinerary", "")
        else:
            draft = result.get("itinerary", "")
        st.markdown(draft or "_No draft generated yet._")

# ── Human-in-the-Loop (HITL) Interactive Approval ────────────────────────────
if st.session_state.get("waiting_for_approval"):
    st.markdown(
        """
    <div class="hitl-banner">
        <div class="hitl-title">👤 Human-in-the-Loop Review Required</div>
        <p style="color: #cbd5e1; margin-bottom: 0;">
            The graph has paused execution. Please review the draft above and approve or provide feedback to request revisions.
        </p>
    </div>
    """,
        unsafe_allow_html=True,
    )

    col_choice, col_fb = st.columns([1, 2])
    with col_choice:
        decision = st.radio(
            "Your Decision:",
            ["✅ Approve Plan", "🔄 Request Revisions"],
            index=0,
            horizontal=False,
        )
    with col_fb:
        user_feedback = st.text_area(
            "Revision feedback (optional if approving):",
            placeholder="e.g. Please change day 3 to include a temple visit and find hotels closer to Shinjuku station.",
            disabled=(decision == "✅ Approve Plan"),
            height=90,
        )

    if st.button("🚀 Submit Decision & Resume Pipeline", type="primary"):
        with st.spinner("Resuming graph execution to generate final response..."):
            final_result = app.invoke(
                Command(
                    resume={
                        "approved": (decision == "✅ Approve Plan"),
                        "feedback": user_feedback if decision != "✅ Approve Plan" else "",
                    }
                ),
                config=config,
            )

        st.session_state.latest_result = final_result
        st.session_state.waiting_for_approval = False
        st.rerun()

# ── Final Polished Response ──────────────────────────────────────────────────
final_result = st.session_state.get("latest_result")
if final_result and final_result.get("final_response") and final_result.get("selected_agents"):
    st.markdown("---")
    st.markdown("## 🌟 Final Confirmed Travel Plan")
    st.markdown(final_result["final_response"])

    st.download_button(
        "⬇️ Download Plan (.md)",
        data=final_result["final_response"],
        file_name=f"itinerary_{st.session_state.thread_id}.md",
        mime="text/markdown",
        use_container_width=True,
    )
