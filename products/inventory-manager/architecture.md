# Inventory Manager: Simple Inventory Tracking System Architecture

## 📋 Executive Summary

Inventory Manager is a straightforward inventory tracking system designed for small businesses that need to monitor stock levels, track product movements, and get alerts before running out—without complex warehouse management features they don't need.

---

## 🎯 Problem Statement

### The Business Problem
Small businesses (e-commerce shops, workshops, small retailers) face inventory challenges:
- **Spreadsheet chaos**: Multiple Excel files, always out of sync
- **Manual counting**: Time-consuming physical inventory checks
- **Reactive ordering**: Only realize products are out when customer orders arrive
- **No audit trail**: Can't track why inventory numbers changed
- **Expensive software**: Enterprise systems cost $100-500/month with features they don't need

### User Pain Points
1. **Operations Staff**: Spend hours manually updating spreadsheets
2. **Purchasing Managers**: Miss reorder windows, causing stockouts
3. **Warehouse Workers**: Unclear about where items are located
4. **Business Owners**: No visibility into inventory value or turnover rates
5. **All Users**: Discrepancies between records and physical count

### Success Metrics
- Reduce time spent on inventory updates by 75%
- Achieve 95% inventory accuracy
- Eliminate stockouts on high-demand items
- Cost < $30/month for up to 5,000 SKUs

---

## 👥 Target Users

### Primary: Operations Staff
- **Age**: 22-45
- **Tech Savvy**: Low to medium
- **Goals**: Update inventory quickly, find items fast, minimize errors
- **Frustrations**: Slow interfaces, complex workflows, unclear product information

### Secondary: Purchasing Managers
- **Age**: 28-55
- **Tech Savvy**: Medium
- **Goals**: Know what to reorder and when, track supplier performance
- **Frustrations**: Lack of alerts, manual calculations, poor reporting

### Tertiary: Business Owners
- **Age**: 30-65
- **Tech Savvy**: Low to high
- **Goals**: Understand inventory value, optimize stock levels, reduce waste
- **Frustrations**: No insights into slow-moving items, over-investment in stock

---

## ✨ Key Features

### MVP (Phase 1)
1. **Product Catalog**: Add/edit products with SKU, name, description, category
2. **Stock Tracking**: Current quantity, location, reorder level
3. **Adjustments**: Add, remove, or correct inventory with reason codes
4. **Low Stock Alerts**: Email notifications when items hit reorder level
5. **Search & Filter**: Quick product lookup by SKU, name, or category
6. **Audit Trail**: Complete history of all inventory changes
7. **Basic Reports**: Stock value, low stock items, movement history

### Phase 2 (Future)
- Barcode scanning for faster entry
- Multiple warehouse locations
- Batch operations (bulk import/export)
- Purchase order management
- Supplier contact management
- Advanced analytics (ABC analysis, turnover rates)
- Mobile app for warehouse floor

---

## 🏗️ System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Web Application (React SPA)               │  │
│  │  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │  Product    │  │  Inventory  │               │  │
│  │  │  Management │  │  Dashboard  │               │  │
│  │  └─────────────┘  └─────────────┘               │  │
│  │  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │  Adjustment │  │   Reports   │               │  │
│  │  │    Form     │  │    View     │               │  │
│  │  └─────────────┘  └─────────────┘               │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API
                        │
┌───────────────────────┴─────────────────────────────────┐
│                  Application Layer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │         API Server (Python/FastAPI)              │  │
│  │  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │   Product   │  │  Adjustment │               │  │
│  │  │   Service   │  │   Service   │               │  │
│  │  └─────────────┘  └─────────────┘               │  │
│  │  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │    Alert    │  │   Reporting │               │  │
│  │  │   Service   │  │   Service   │               │  │
│  │  └─────────────┘  └─────────────┘               │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────┐
│                    Data Layer                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │         PostgreSQL Database                      │  │
│  │  - Products table                                │  │
│  │  - Inventory table                               │  │
│  │  - AdjustmentLog table                           │  │
│  │  - Users table                                   │  │
│  │  - Categories table                              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

External Services:
┌─────────────────┐
│  Email Service  │  (SendGrid/AWS SES)
│ (Alerts/Notifs) │
└─────────────────┘
```

### Component Responsibilities

**Client Layer**
- Responsive web interface
- Client-side validation
- Optimistic updates for better UX
- Local state management (React Context/Zustand)

**Application Layer**
- RESTful API endpoints
- Business logic enforcement
- Authentication/authorization
- Background job scheduling (alerts)

**Data Layer**
- Persistent storage
- Data integrity constraints
- Full-text search (PostgreSQL)
- Historical data retention

### Key Design Decisions

1. **Single Page Application**: React for responsive, interactive experience
2. **Python Backend**: Fast development with strong typing (Pydantic)
3. **PostgreSQL Full-Text Search**: Built-in search without additional services
4. **Synchronous Architecture**: Simpler to maintain, sufficient for expected load
5. **Server-Side Rendering Not Needed**: Not SEO-dependent, internal tool

---

## 📊 Data Models

### Core Entities

#### Product
```python
{
  id: UUID (primary key)
  sku: str (unique, indexed)
  name: str
  description: str | None
  category_id: UUID (FK to Category)
  unit_cost: Decimal(10, 2)
  reorder_level: int
  reorder_quantity: int
  location: str | None  # e.g., "Shelf A3"
  is_active: bool
  created_at: datetime
  updated_at: datetime
  created_by: UUID (FK to User)
}
```

#### Inventory
```python
{
  id: UUID (primary key)
  product_id: UUID (FK to Product, unique)
  quantity: int
  reserved_quantity: int (for orders not yet shipped)
  available_quantity: int (computed: quantity - reserved)
  last_counted_at: datetime | None
  last_counted_by: UUID (FK to User) | None
  updated_at: datetime
}
```

#### AdjustmentLog
```python
{
  id: UUID (primary key)
  product_id: UUID (FK to Product)
  adjustment_type: enum(
    'INITIAL_STOCK',    # First entry
    'RESTOCK',          # Received from supplier
    'SALE',             # Sold to customer
    'DAMAGE',           # Damaged goods
    'THEFT',            # Shrinkage
    'RETURN',           # Customer return
    'COUNT_CORRECTION', # Physical count adjustment
    'OTHER'
  )
  quantity_change: int (positive or negative)
  previous_quantity: int
  new_quantity: int
  reason: str | None
  reference_number: str | None  # PO number, invoice, etc.
  user_id: UUID (FK to User)
  created_at: datetime
}
```

#### Category
```python
{
  id: UUID (primary key)
  name: str (unique)
  description: str | None
  parent_id: UUID (FK to Category) | None  # For hierarchies
  is_active: bool
  created_at: datetime
}
```

#### User
```python
{
  id: UUID (primary key)
  email: str (unique)
  name: str
  role: enum('VIEWER', 'EDITOR', 'ADMIN')
  hashed_password: str
  is_active: bool
  last_login_at: datetime | None
  created_at: datetime
  updated_at: datetime
}
```

#### AlertConfiguration
```python
{
  id: UUID (primary key)
  user_id: UUID (FK to User)
  alert_type: enum('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK')
  is_enabled: bool
  email_notifications: bool
  created_at: datetime
  updated_at: datetime
}
```

### Database Indexes
- `products.sku` - Fast SKU lookup
- `products.name` - Search by name (full-text index)
- `inventory.product_id` - Join with products
- `adjustment_log.product_id, created_at` - Audit trail queries
- `adjustment_log.created_at` - Time-based reporting

### Data Constraints
- `inventory.quantity >= 0` - No negative stock
- `inventory.reserved_quantity >= 0` - No negative reserves
- `inventory.reserved_quantity <= inventory.quantity` - Can't reserve more than available

### Computed Fields
- `inventory.available_quantity = quantity - reserved_quantity`
- `inventory.is_low_stock = available_quantity <= product.reorder_level`
- `product.inventory_value = inventory.quantity * product.unit_cost`

---

## 🚀 Technology Choices

### Frontend
**Choice**: React + TypeScript + Tailwind CSS
**Reasoning**:
- React: Component reusability, large ecosystem
- TypeScript: Type safety prevents many runtime errors
- Tailwind: Rapid UI development with consistent design
- React Query: Efficient server state management

**Alternatives Considered**:
- Vue.js: Good, but React has larger talent pool
- Angular: Too heavy for this simple application

### Backend
**Choice**: Python + FastAPI
**Reasoning**:
- FastAPI: Automatic API documentation, fast development
- Python: Readable, great for data processing
- Pydantic: Excellent request/response validation
- Async support for future scalability

**Alternatives Considered**:
- Django: Too opinionated, includes unneeded features
- Node.js: Would work but Python better for data analytics later

### Database
**Choice**: PostgreSQL
**Reasoning**:
- Robust full-text search built-in
- JSON support for flexible product attributes
- Strong data integrity constraints
- Excellent performance for this scale (< 100K products)

**Alternatives Considered**:
- MySQL: Weaker full-text search
- MongoDB: Overkill for this structured data

### Authentication
**Choice**: JWT with HTTP-only cookies
**Reasoning**:
- Stateless authentication
- Works across domains (future mobile app)
- Secure against XSS (HTTP-only cookies)

### Email Service
**Choice**: AWS SES
**Reasoning**:
- Cost-effective (< $1/month for typical volume)
- Reliable delivery
- Easy integration with Python

**Alternatives Considered**:
- SendGrid: More expensive but better analytics
- Mailgun: Similar pricing, less AWS integration

---

## 🌐 Deployment Strategy

### Infrastructure
**Platform**: Railway/Render (simplified cloud platform)
- **Frontend**: Static hosting with CDN
- **Backend**: Containerized Python app
- **Database**: Managed PostgreSQL
- **File Storage**: S3 (for future features like product images)

### Environment Configuration
```
Development:
- Local PostgreSQL in Docker
- Local backend server
- Hot reload for frontend

Staging:
- Matches production architecture
- Separate database with test data
- Deployed on every merge to main

Production:
- Automated deployments on tag creation
- Blue-green deployment for zero downtime
- Automatic rollback on health check failure
```

### CI/CD Pipeline
```
1. Developer pushes to feature branch
2. GitHub Actions runs:
   - Python linting (Black, isort, flake8)
   - TypeScript compilation
   - Unit tests (pytest, Jest)
   - Type checking (mypy)
3. On merge to main:
   - Deploy to staging
   - Run integration tests
   - Notify team in Slack
4. On tag creation (v*):
   - Deploy to production
   - Run smoke tests
   - Notify via PagerDuty if tests fail
```

### Monitoring
- **Application**: Sentry for error tracking
- **Infrastructure**: Platform-native monitoring (Railway dashboard)
- **Uptime**: UptimeRobot pinging every 5 minutes
- **Logs**: Structured JSON logs, searchable in platform dashboard

### Backup Strategy
- **Database**: Automated daily backups, 30-day retention
- **Exports**: Weekly CSV exports of all data to S3
- **Recovery Time**: < 1 hour for database restore

---

## ⚖️ Tradeoffs & Design Decisions

### 1. Computed vs Stored Values
**Decision**: Compute `available_quantity` on read
**Reasoning**:
- **Pro**: Always accurate, no sync issues
- **Pro**: Simpler code, fewer bugs
- **Con**: Slightly slower queries
- **Con**: Can't easily index for filtering
**Mitigation**: Add database view if performance becomes issue

### 2. Real-Time Updates vs Periodic Refresh
**Decision**: User-triggered refresh (no WebSocket)
**Reasoning**:
- **Pro**: Much simpler architecture
- **Pro**: Sufficient for use case (not a real-time system)
- **Con**: Users see slightly stale data
- **Con**: Must manually refresh to see others' changes
**Mitigation**: Auto-refresh every 60 seconds on dashboard

### 3. Soft Delete vs Hard Delete
**Decision**: Soft delete (is_active flag) for products
**Reasoning**:
- **Pro**: Preserve audit trail
- **Pro**: Can reference deleted products in old transactions
- **Con**: Database grows over time
- **Con**: Must filter `is_active=true` in all queries
**Mitigation**: Archive old data after 2 years

### 4. Role-Based Access Control (RBAC)
**Decision**: Simple 3-role system (VIEWER, EDITOR, ADMIN)
**Reasoning**:
- **Pro**: Easy to understand and explain
- **Pro**: Covers 95% of use cases
- **Con**: Not granular enough for complex orgs
- **Con**: Can't give partial permissions
**Future**: Add feature-level permissions if needed

### 5. Search: Elasticsearch vs PostgreSQL Full-Text
**Decision**: PostgreSQL full-text search
**Reasoning**:
- **Pro**: One less service to manage
- **Pro**: Good enough for < 10K products
- **Pro**: Lower operational cost
- **Con**: Less powerful than Elasticsearch
- **Con**: Slower on very large datasets
**Threshold**: Switch to Elasticsearch if > 50K products or search is slow

### 6. Multi-Tenancy Approach
**Decision**: Shared database with organization_id partition
**Reasoning**:
- **Pro**: Lower per-customer cost
- **Pro**: Easier to maintain single codebase
- **Con**: Must be careful with data isolation
- **Con**: One customer's load affects others
**Mitigation**: Strict row-level security policies, connection pooling

---

## 🤖 AI vs Human Decisions

### Human-Led Decisions (Strategic)
These required business understanding, user empathy, and architectural judgment:

1. **Problem Definition** (100% Human)
   - Identified target users (small businesses, not enterprises)
   - Defined scope: inventory tracking, NOT warehouse management
   - Prioritized simplicity over feature completeness

2. **Feature Prioritization** (100% Human)
   - Chose MVP features based on user research
   - Decided what to defer to Phase 2
   - Balanced effort vs impact for each feature

3. **Data Model Design** (95% Human, 5% AI)
   - Designed core entities and relationships
   - Decided on adjustment types based on real business scenarios
   - AI suggested additional indexes after initial design

4. **Architecture Decisions** (100% Human)
   - Chose Python over Node.js (better for data processing)
   - Selected synchronous over event-driven (simpler, sufficient)
   - Decided against microservices (premature optimization)

5. **Technology Stack** (100% Human)
   - Evaluated options based on team skills, cost, maintainability
   - Chose managed services over self-hosted (reduce ops burden)

6. **Security Model** (100% Human)
   - Designed role-based access control
   - Chose JWT + HTTP-only cookies (security vs convenience)
   - Defined data retention policies

### AI-Assisted Implementation (Tactical)
AI accelerated development but humans validated correctness:

1. **Boilerplate Code** (30% Human, 70% AI)
   - FastAPI route handlers for CRUD operations
   - Pydantic models for request/response validation
   - Database models and migrations
   - **Human Review**: Business logic, error handling, edge cases

2. **Frontend Components** (40% Human, 60% AI)
   - React components for forms and tables
   - Tailwind CSS styling
   - **Human Design**: UX flows, interactions, accessibility

3. **Unit Tests** (50% Human, 50% AI)
   - AI generated happy path tests
   - Human added edge cases, error scenarios
   - **Human**: Integration tests and end-to-end tests

4. **Database Queries** (30% Human, 70% AI)
   - AI wrote basic SQL queries
   - Human optimized complex queries with indexes
   - Human added query plans analysis

5. **API Documentation** (20% Human, 80% AI)
   - FastAPI auto-generates OpenAPI docs
   - AI wrote detailed descriptions
   - Human reviewed for accuracy and clarity

6. **This Architecture Document** (60% Human, 40% AI)
   - Human wrote problem statement, tradeoffs, decisions
   - AI helped structure and format
   - AI generated code examples
   - Human refined all content for accuracy

### Never Delegated to AI
- User interviews and research
- Feature prioritization
- Architecture tradeoffs
- Security and privacy decisions
- Database schema design
- Performance optimization strategies
- Production incident response

### AI Workflow Example
**Task**: Implement product creation endpoint

1. **Human**: Define API contract, validation rules, business logic
2. **AI**: Generate FastAPI route handler, Pydantic models
3. **Human**: Review code, add missing validations
4. **AI**: Generate unit tests
5. **Human**: Add edge case tests, integration tests
6. **Human**: Manual testing with Postman
7. **Human**: Approve and merge

---

## 📈 Results & Metrics (Projected)

### Development Efficiency
- **Time to MVP**: 4 weeks (solo developer)
- **AI Contribution**: ~50% time savings on implementation
- **Lines of Code**: ~3,500 (excluding tests and dependencies)
- **Test Coverage**: 80% (target)

### Performance Targets
- API response time (p95): < 300ms
- Page load time: < 2 seconds
- Search response: < 500ms for 10K products
- Database queries: < 100ms for common operations

### User Experience Metrics
- Time to create product: < 30 seconds
- Time to adjust inventory: < 15 seconds
- Search to result: < 3 seconds
- Dashboard load time: < 2 seconds

### Business Metrics
- Infrastructure cost: ~$25/month (1K products, 5 users)
- Support tickets: < 2 per week (target)
- User training time: < 1 hour
- Data accuracy: > 95% (after 3 months)

---

## 🔍 Lessons Learned

### What Worked Well
1. **Simple data model**: Easy to explain and extend
2. **FastAPI auto-docs**: Reduced documentation burden
3. **TypeScript on frontend**: Caught bugs before deployment
4. **PostgreSQL full-text search**: Avoided extra infrastructure

### What Could Be Improved
1. **More user testing**: Assumed wrong workflows initially
2. **Earlier performance testing**: Found slow queries late
3. **Better initial data seeding**: Testing was harder without good fixtures

### What I'd Do Differently
1. **Add product images from start**: Users expect this, harder to add later
2. **Implement batch operations earlier**: Manual one-by-one is tedious
3. **Build mobile-friendly from day one**: Users work on warehouse floor

### Key Insights
1. **Simplicity wins**: Users prefer fewer features done well
2. **Audit trail is critical**: Users need to trust the system
3. **Search is make-or-break**: If users can't find products, system fails
4. **Email alerts drive adoption**: Passive value keeps users engaged

---

## 📚 References & Resources

### Design Patterns
- Repository pattern for data access
- Service layer for business logic
- DTO (Data Transfer Objects) via Pydantic

### Key Libraries & Frameworks
**Backend**:
- FastAPI 0.100+ (web framework)
- SQLAlchemy 2.0+ (ORM)
- Alembic (migrations)
- Pydantic 2.0+ (validation)
- pytest (testing)

**Frontend**:
- React 18+ (UI library)
- TypeScript 5+ (type safety)
- Tailwind CSS 3+ (styling)
- React Query (server state)
- React Router (navigation)

### Tools & Services
- GitHub Actions (CI/CD)
- Sentry (error tracking)
- Railway/Render (hosting)
- AWS SES (email)

### Documentation
- API: Auto-generated by FastAPI (OpenAPI 3.0)
- Database: ER diagram in Mermaid
- User Guide: Markdown in `/docs` directory

---

## 🎯 Success Criteria

### Must Have (Launch Blockers)
- ✅ Create/read/update products
- ✅ Track inventory quantities
- ✅ Record adjustments with audit trail
- ✅ Search products by SKU or name
- ✅ Email alerts for low stock
- ✅ Basic reporting (stock value, low stock)

### Should Have (Post-Launch)
- Barcode scanning
- Bulk import/export
- Multiple locations
- Purchase order tracking

### Nice to Have (Future)
- Mobile app
- Advanced analytics
- Supplier management
- Forecasting

---

*This architecture document is a portfolio demonstration. The described system showcases product thinking and technical design skills but may not be fully implemented.*
