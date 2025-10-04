from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
import uuid
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client["wealth_tracker"]

# FastAPI app
app = FastAPI(title="Wealth Management API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
api_router = APIRouter(prefix="/api")

# --- Data Models ---

class CustomField(BaseModel):
    field_name: str
    field_type: str  # 'text', 'number', 'date', 'email', 'phone'
    is_required: bool = False

class InvestorBase(BaseModel):
    name: str
    relationship: str
    email: Optional[str] = None
    phone: Optional[str] = None
    mobile_number: Optional[str] = None
    address: Optional[str] = None
    pan_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = None
    photo_url: Optional[str] = None
    custom_fields: dict = Field(default_factory=dict)

class InvestorCreate(InvestorBase):
    pass

class Investor(InvestorBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InvestmentBase(BaseModel):
    investor_id: str
    investment_name: str
    investment_type: str
    amount: float
    purchase_date: Optional[date] = None
    interest_rate: Optional[float] = None
    interest_date: Optional[str] = None  # DDMM format
    maturity_date: Optional[date] = None
    description: Optional[str] = None
    issuer: Optional[str] = None
    photo_url: Optional[str] = None
    custom_fields: dict = Field(default_factory=dict)

class InvestmentCreate(InvestmentBase):
    pass

class Investment(InvestmentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CustomFieldConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    entity_type: str  # 'investor' or 'investment'
    field_name: str
    field_type: str
    is_required: bool = False
    options: List[str] = Field(default_factory=list)  # For dropdown fields
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DashboardStats(BaseModel):
    total_family_members: int
    total_investments: int
    total_portfolio_value: float
    investment_types_count: dict
    recent_investments: List[Investment]

# --- Helper Functions ---

async def get_family_member_by_id(member_id: str):
    member = await db.family_members.find_one({"id": member_id})
    return FamilyMember(**member) if member else None

async def check_family_member_has_investments(member_id: str):
    count = await db.investments.count_documents({"family_member_id": member_id})
    return count > 0

# --- API Endpoints ---

@api_router.get("/")
async def root():
    return {"message": "Wealth Management API", "version": "1.0.0"}

# Family Member Endpoints
@api_router.post("/family-members", response_model=FamilyMember)
async def create_family_member(member_data: FamilyMemberCreate):
    member = FamilyMember(**member_data.dict())
    await db.family_members.insert_one(member.dict())
    return member

@api_router.get("/family-members", response_model=List[FamilyMember])
async def get_family_members():
    members_cursor = db.family_members.find()
    members = await members_cursor.to_list(1000)
    return [FamilyMember(**member) for member in members]

@api_router.get("/family-members/{member_id}", response_model=FamilyMember)
async def get_family_member(member_id: str):
    member = await get_family_member_by_id(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return member

@api_router.put("/family-members/{member_id}", response_model=FamilyMember)
async def update_family_member(member_id: str, member_data: FamilyMemberCreate):
    existing_member = await get_family_member_by_id(member_id)
    if not existing_member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    updated_data = member_data.dict()
    updated_data["updated_at"] = datetime.utcnow()
    
    await db.family_members.update_one(
        {"id": member_id}, 
        {"$set": updated_data}
    )
    
    updated_member = await get_family_member_by_id(member_id)
    return updated_member

@api_router.delete("/family-members/{member_id}")
async def delete_family_member(member_id: str):
    # Check if family member exists
    member = await get_family_member_by_id(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    # Check if member has investments (delete protection)
    has_investments = await check_family_member_has_investments(member_id)
    if has_investments:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete family member with existing investments. Please delete investments first."
        )
    
    # Delete family member
    result = await db.family_members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete family member")
    
    return {"success": True, "message": f"Family member {member.name} deleted successfully"}

# Investment Endpoints
@api_router.post("/investments", response_model=Investment)
async def create_investment(investment_data: InvestmentCreate):
    # Verify family member exists
    member = await get_family_member_by_id(investment_data.family_member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    investment = Investment(**investment_data.dict())
    await db.investments.insert_one(investment.dict())
    return investment

@api_router.get("/investments", response_model=List[Investment])
async def get_investments(family_member_id: Optional[str] = None):
    filter_query = {}
    if family_member_id:
        filter_query["family_member_id"] = family_member_id
    
    investments_cursor = db.investments.find(filter_query)
    investments = await investments_cursor.to_list(1000)
    return [Investment(**investment) for investment in investments]

@api_router.get("/investments/{investment_id}", response_model=Investment)
async def get_investment(investment_id: str):
    investment = await db.investments.find_one({"id": investment_id})
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    return Investment(**investment)

@api_router.put("/investments/{investment_id}", response_model=Investment)
async def update_investment(investment_id: str, investment_data: InvestmentCreate):
    # Verify investment exists
    existing_investment = await db.investments.find_one({"id": investment_id})
    if not existing_investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    # Verify family member exists
    member = await get_family_member_by_id(investment_data.family_member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    updated_data = investment_data.dict()
    updated_data["updated_at"] = datetime.utcnow()
    
    await db.investments.update_one(
        {"id": investment_id}, 
        {"$set": updated_data}
    )
    
    updated_investment = await db.investments.find_one({"id": investment_id})
    return Investment(**updated_investment)

@api_router.delete("/investments/{investment_id}")
async def delete_investment(investment_id: str):
    investment = await db.investments.find_one({"id": investment_id})
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    
    result = await db.investments.delete_one({"id": investment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete investment")
    
    return {"success": True, "message": "Investment deleted successfully"}

# Dashboard Stats Endpoint
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    # Get total counts
    total_family_members = await db.family_members.count_documents({})
    total_investments = await db.investments.count_documents({})
    
    # Calculate total portfolio value
    investments_cursor = db.investments.find()
    investments = await investments_cursor.to_list(1000)
    total_portfolio_value = sum(inv["amount"] for inv in investments)
    
    # Get investment types count
    pipeline = [
        {"$group": {"_id": "$investment_type", "count": {"$sum": 1}}}
    ]
    investment_types_cursor = db.investments.aggregate(pipeline)
    investment_types_result = await investment_types_cursor.to_list(100)
    investment_types_count = {item["_id"]: item["count"] for item in investment_types_result}
    
    # Get recent investments (last 5)
    recent_investments_cursor = db.investments.find().sort("created_at", -1).limit(5)
    recent_investments_data = await recent_investments_cursor.to_list(5)
    recent_investments = [Investment(**inv) for inv in recent_investments_data]
    
    return DashboardStats(
        total_family_members=total_family_members,
        total_investments=total_investments,
        total_portfolio_value=total_portfolio_value,
        investment_types_count=investment_types_count,
        recent_investments=recent_investments
    )

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
