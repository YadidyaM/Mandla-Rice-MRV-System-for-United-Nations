# 📖 Gates Open Research API Integration

## Overview

The **Gates Open Research API** provides open-access research papers and data from the Bill & Melinda Gates Foundation. Unlike other services, **no API key or registration is required** - all endpoints are publicly accessible.

This integration enables our MRV system to access cutting-edge research on:
- Climate change and agriculture
- Rice farming and methane emissions
- Sustainable agriculture practices
- Carbon credit methodologies

## 🔧 Configuration

### Environment Variables

```ini
# UN/UNDP Integration
BILL_GATES_FOUNDATION_API_KEY=""
```

**Note**: The API key variable is kept for consistency but is not used since no authentication is required.

## 🚀 API Endpoints

### Base URL
```
https://gatesopenresearch.org/extapi
```

### Available Endpoints

#### 1. Search Articles
```
GET /api/v1/research/search?query={query}&page={page}&rows={rows}
```

**Parameters:**
- `query` (required): Solr-style search query
- `page` (optional): Page number (default: 1)
- `rows` (optional): Results per page (default: 100, max: 100)
- `sort` (optional): Sort criteria

**Example:**
```bash
curl "http://localhost:4000/api/v1/research/search?query=R_ABS:\"rice farming\"&page=1&rows=50"
```

#### 2. Climate & Agriculture Research
```
GET /api/v1/research/climate-agriculture?page={page}
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/research/climate-agriculture?page=1"
```

#### 3. Rice Methane Research
```
GET /api/v1/research/rice-methane?page={page}
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/research/rice-methane?page=1"
```

#### 4. Sustainable Agriculture Research
```
GET /api/v1/research/sustainable-agriculture?page={page}
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/research/sustainable-agriculture?page=1"
```

#### 5. MRV Research Insights
```
GET /api/v1/research/mrv-insights
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/research/mrv-insights"
```

#### 6. Methodology Research by Component
```
GET /api/v1/research/methodology/{component}
```

**Components:**
- `emissions` - Emission factor research
- `verification` - Verification methodologies
- `monitoring` - Monitoring techniques
- `reporting` - Reporting standards

**Example:**
```bash
curl "http://localhost:4000/api/v1/research/methodology/emissions"
```

#### 7. Article XML by DOI
```
GET /api/v1/research/article/xml/{doi}
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/research/article/xml/10.12688/gatesopenres.12838.2"
```

#### 8. Article PDF by DOI
```
GET /api/v1/research/article/pdf/{doi}
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/research/article/pdf/10.12688/gatesopenres.12838.2"
```

#### 9. All Article URLs
```
GET /api/v1/research/articles/urls
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/research/articles/urls"
```

## 🔍 Query Syntax

### Solr-Style Search Queries

The API uses Solr-style query syntax for advanced searching:

#### Basic Queries
```bash
# Search for "rice farming" in abstract
R_ABS:"rice farming"

# Search for "methane emissions" in abstract
R_ABS:"methane emissions"

# Search for "climate change" in abstract
R_ABS:"climate change"
```

#### Complex Queries
```bash
# Multiple terms with OR
R_ABS:"rice farming" OR R_ABS:"methane"

# Multiple terms with AND
R_ABS:"rice farming" AND R_ABS:"methane"

# Combined queries
R_ABS:"rice farming" AND (R_ABS:"methane" OR R_ABS:"greenhouse gas")
```

#### Field-Specific Searches
```bash
# Search in title
R_TITLE:"sustainable agriculture"

# Search in authors
R_AUTHOR:"Smith"

# Search in keywords
R_KEYWORD:"carbon credit"
```

## 📊 Rate Limits

- **100 requests per 60 seconds maximum**
- **100 results per request maximum**
- Use pagination (`page` parameter) for more results
- Built-in rate limiting in our service (600ms between requests)

## 💡 Usage Examples

### 1. Find Recent Rice Methane Research

```javascript
import axios from 'axios';

const response = await axios.get('http://localhost:4000/api/v1/research/rice-methane?page=1');
const papers = response.data.data.response.docs;

papers.forEach(paper => {
  console.log(`Title: ${paper.title}`);
  console.log(`DOI: ${paper.doi}`);
  console.log(`Authors: ${paper.author?.join(', ')}`);
  console.log('---');
});
```

### 2. Search for Specific Methodology

```javascript
const response = await axios.get('http://localhost:4000/api/v1/research/search', {
  params: {
    query: 'R_ABS:"alternate wetting drying" AND R_ABS:"rice"',
    page: 1,
    rows: 50
  }
});
```

### 3. Get Research Insights for MRV Development

```javascript
const insights = await axios.get('http://localhost:4000/api/v1/research/mrv-insights');
console.log('Total climate-agriculture papers:', insights.data.data.climateAgriculture.totalResults);
console.log('Total rice methane papers:', insights.data.data.riceMethane.totalResults);
console.log('Recommendations:', insights.data.data.recommendations);
```

## 🔬 Research Categories

### Climate & Agriculture
- Climate change impacts on agriculture
- Adaptation strategies
- Mitigation techniques
- Policy recommendations

### Rice Methane Research
- Methane emission factors
- Alternate Wetting and Drying (AWD)
- System of Rice Intensification (SRI)
- Emission measurement methodologies

### Sustainable Agriculture
- Climate-smart agriculture
- Conservation practices
- Soil health management
- Water efficiency

## 📚 Integration with MRV System

### 1. Methodology Validation
Use research papers to validate emission factors and calculation methods.

### 2. Best Practice Identification
Identify proven sustainable agriculture practices for farmer recommendations.

### 3. Scientific Backing
Support MRV reports with peer-reviewed research citations.

### 4. Continuous Improvement
Stay updated with latest research for methodology enhancements.

## 🚨 Error Handling

### Common Errors

#### Rate Limit Exceeded
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please wait before trying again."
}
```

#### Invalid Query
```json
{
  "success": false,
  "error": "Invalid query parameter",
  "message": "Please provide a valid search query"
}
```

#### DOI Not Found
```json
{
  "success": false,
  "error": "Article not found",
  "message": "No article found with the specified DOI"
}
```

## 🔧 Development Notes

### Service Architecture
- `GatesResearchService`: Core service for API interactions
- `ResearchController`: HTTP request handling
- Built-in rate limiting (600ms between requests)
- Error handling and logging

### Caching Considerations
- Research data changes infrequently
- Consider implementing Redis caching for search results
- Cache article metadata, not full PDFs/XML

### Monitoring
- Track API usage and rate limit compliance
- Monitor response times and error rates
- Log search queries for analytics

## 📖 Additional Resources

- [Gates Open Research Website](https://gatesopenresearch.org/)
- [API Documentation](https://gatesopenresearch.org/extapi)
- [Solr Query Syntax](https://solr.apache.org/guide/8_11/the-standard-query-parser.html)

## ✅ Summary

- **No API key required** - completely open access
- **Solr-style queries** for powerful searching
- **Rate limited** to 100 requests per minute
- **Integrated** with our MRV system
- **Research-backed** methodology development

This integration provides our MRV system with access to world-class research on climate-smart agriculture, enabling evidence-based carbon credit methodologies and farmer recommendations.
