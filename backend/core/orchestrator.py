"""
Orchestrator module for IntentBridge.

Manages the AI pipeline workflow by chaining the Intent Classifier,
Ambiguity Resolver, and Execution Planner modules in sequence.
Returns either clarification questions or a complete execution plan.
"""
from backend.modules.intent_classifier import IntentClassifier
from backend.modules.ambiguity_resolver import AmbiguityResolver
from backend.modules.execution_planner import ExecutionPlanner
from backend.modules.build_engine import BuildEngine
from backend.modules.validator import Validator
import logging

class Orchestrator:
    def __init__(self):
        self.classifier = IntentClassifier()
        self.resolver = AmbiguityResolver()
        self.planner = ExecutionPlanner()
        self.builder = BuildEngine()
        self.validator = Validator()
        self.logger = logging.getLogger("Orchestrator")

    async def execute_workflow(self, session_id: str, user_input: str, history: list = None) -> dict:
        self.logger.info(f"Executing workflow for session {session_id}")
        
        # 1. Intent Classification
        intent = await self.classifier.process(user_input)
        
        # 2. Ambiguity Resolution
        resolution = await self.resolver.process(intent, history or [])
        
        result = {}
        if resolution.get("has_ambiguity"):
            result = {
                "status": "clarification_needed",
                "intent": intent,
                "questions": resolution.get("questions"),
                "analysis": resolution.get("analysis")
            }
        else:
            # 3. Execution Planning
            plan = await self.planner.process(intent)
            result = {
                "status": "plan_generated",
                "intent": intent,
                "plan": plan
            }
            
        # TODO: Save result to Database
        return result
