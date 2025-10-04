from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Investor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InvestorCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None

class InvestorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class Investment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    investor_id: str
    amount: float
    investment_type: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InvestmentCreate(BaseModel):
    investor_id: str
    amount: float
    investment_type: str
    description: Optional[str] = None

class DashboardStats(BaseModel):
    total_investors: int
    total_investments: int
    total_portfolio_value: float

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Investment Tracking API"}

# Investor Management Routes
@api_router.post("/investors", response_model=Investor)
async def create_investor(investor_data: InvestorCreate):
    investor_dict = investor_data.dict()
    investor = Investor(**investor_dict)
    await db.investors.insert_one(investor.dict())
    return investor

@api_router.get("/investors", response_model=List[Investor])
async def get_investors():
    investors = await db.investors.find().to_list(1000)
    return [Investor(**investor) for investor in investors]

@api_router.get("/investors/{investor_id}", response_model=Investor)
async def get_investor(investor_id: str):
    investor = await db.investors.find_one({"id": investor_id})
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    return Investor(**investor)

@api_router.put("/investors/{investor_id}", response_model=Investor)
async def update_investor(investor_id: str, investor_data: InvestorUpdate):
    update_data = {k: v for k, v in investor_data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    update_data["updated_at"] = datetime.utcnow()
    result = await db.investors.update_one({"id": investor_id}, {"$set": update_data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Investor not found")
    
    updated_investor = await db.investors.find_one({"id": investor_id})
    return Investor(**updated_investor)

@api_router.delete("/investors/{investor_id}")
async def delete_investor(investor_id: str):
    # First check if investor exists
    investor = await db.investors.find_one({"id": investor_id})
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    
    # Delete all investments for this investor first
    await db.investments.delete_many({"investor_id": investor_id})
    
    # Then delete the investor
    result = await db.investors.delete_one({"id": investor_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete investor")
    
    return {"success": True, "message": f"Investor {investor['name']} deleted successfully"}

# Investment Management Routes
@api_router.post("/investments", response_model=Investment)
async def create_investment(investment_data: InvestmentCreate):
    # Check if investor exists
    investor = await db.investors.find_one({"id": investment_data.investor_id})
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    
    investment_dict = investment_data.dict()
    investment = Investment(**investment_dict)
    await db.investments.insert_one(investment.dict())
    return investment

@api_router.get("/investments", response_model=List[Investment])
async def get_investments():
    investments = await db.investments.find().to_list(1000)
    return [Investment(**investment) for investment in investments]

@api_router.get("/investments/{investment_id}", response_model=Investment)
async def get_investment(investment_id: str):
    investment = await db.investments.find_one({"id": investment_id})
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")
    return Investment(**investment)

@api_router.delete("/investments/{investment_id}")
async def delete_investment(investment_id: str):
    result = await db.investments.delete_one({"id": investment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Investment not found")
    return {"success": True, "message": "Investment deleted successfully"}

# Dashboard Stats
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    total_investors = await db.investors.count_documents({})
    total_investments = await db.investments.count_documents({})
    
    # Calculate total portfolio value
    pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result = await db.investments.aggregate(pipeline).to_list(1)
    total_portfolio_value = result[0]["total"] if result else 0.0
    
    return DashboardStats(
        total_investors=total_investors,
        total_investments=total_investments,
        total_portfolio_value=total_portfolio_value
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
