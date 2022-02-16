//query - //search=coder&page=2&category=shortsleeves&rating[gte]=4
// &price[lte]=999&price[gte]=199&limit=5
class ProductFilters{
    constructor(base,queryObject) // take input of base model class and query object
    {
        this.base = base;
        this.queryObject = queryObject;
    }
    search(){
        const searchWord = this.queryObject.search ? {
            name:{
                $regex: this.queryObject.search,
                $options: 'i'
            }
        } : {}  
        this.base = this.base.find({... searchWord});
        return this;
    }
    filter(){
        const copyQueryObject = {... this.queryObject};

        delete copyQueryObject["search"]; // deleting search as that functionality is implemented in another function
        delete copyQueryObject["page"]; // deleting page as that functionality is implemented in another function
        delete copyQueryObject["limit"]; // deleting limit as that functionality is implemented in another function

        let stringQuery = JSON.stringify(copyQueryObject);
        stringQuery = stringQuery.replace(
            /\b(gte|lte|gt|lt)\b/g,
            (m) => `$${m}`
        ); // mathing query parameters like gte and lte and replacing them with $gte to pass to mongodb as query objects
        const jsonQuery = JSON.parse(stringQuery);
        //console.log(jsonQuery);
        //this.base = this.base.find({ rating: { $gt: '2' }});
        this.base = this.base.find(jsonQuery);
        return this;
    }
    pager(itemsPerPage){
        let currentPage = 1;
        if(this.queryObject.page){
            currentPage = this.queryObject.page;
        }
        const pageToSkip = itemsPerPage * (currentPage-1);
        this.base = this.base.limit(itemsPerPage).skip(pageToSkip);
        return this;
    }
}

module.exports = ProductFilters;