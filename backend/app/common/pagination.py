from typing import Generic, List, TypeVar
from fastapi import Query
from pydantic import BaseModel
from pydantic.generics import GenericModel

T = TypeVar("T")

class PaginationParams:
    def __init__(
        self,
        skip: int = Query(0, ge=0, description="Number of items to skip"),
        limit: int = Query(50, ge=1, le=100, description="Maximum number of items to return"),
    ):
        self.skip = skip
        self.limit = limit

class PaginatedResponse(GenericModel, Generic[T]):
    items: List[T]
    total: int
    skip: int
    limit: int
    has_more: bool

    @classmethod
    def create(cls, items: List[T], total: int, skip: int, limit: int):
        return cls(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            has_more=(skip + len(items)) < total,
        )
