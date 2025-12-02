"""add saved words table

Revision ID: 004
Revises: 003
Create Date: 2025-11-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create saved_words table (reusing existing languageenum type)
    op.create_table('saved_words',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('word', sa.String(), nullable=False),
        sa.Column('translation', sa.String(), nullable=False),
        sa.Column('context_sentence', sa.Text(), nullable=True),
        sa.Column('language', postgresql.ENUM('yoruba', 'hausa', 'igbo', name='languageenum', create_type=False), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_saved_words_id'), 'saved_words', ['id'], unique=False)
    op.create_index(op.f('ix_saved_words_user_id'), 'saved_words', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop saved_words table
    op.drop_index(op.f('ix_saved_words_user_id'), table_name='saved_words')
    op.drop_index(op.f('ix_saved_words_id'), table_name='saved_words')
    op.drop_table('saved_words')
