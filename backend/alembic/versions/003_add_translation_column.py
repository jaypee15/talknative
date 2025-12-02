"""add translation column to turns

Revision ID: 003
Revises: 002
Create Date: 2025-11-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add ai_response_text_english column to turns table
    op.add_column('turns', sa.Column('ai_response_text_english', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove ai_response_text_english column from turns table
    op.drop_column('turns', 'ai_response_text_english')
