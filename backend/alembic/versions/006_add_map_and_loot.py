"""add map progression and loot tables

Revision ID: 006
Revises: 005
Create Date: 2025-12-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. User Scenario Progress (The Map)
    op.create_table('user_scenario_progress',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('profiles.id'), nullable=False),
        sa.Column('scenario_id', sa.String(), nullable=False),
        sa.Column('stars', sa.Integer(), default=0), # 0=Locked, 1-3=Completed
        sa.Column('unlocked', sa.Boolean(), default=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.UniqueConstraint('user_id', 'scenario_id', name='uq_user_scenario')
    )

    # 2. Proverbs (The Loot Database)
    op.create_table('proverbs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('language', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('literal_translation', sa.Text(), nullable=False),
        sa.Column('meaning', sa.Text(), nullable=False),
        sa.Column('rarity', sa.String(), default='common') # common, rare, legendary
    )

    # 3. User Proverbs (The Wisdom Deck)
    op.create_table('user_proverbs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('profiles.id'), nullable=False),
        sa.Column('proverb_id', sa.String(), sa.ForeignKey('proverbs.id'), nullable=False),
        sa.Column('acquired_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

    # 4. Add cultural flags to Turns
    op.add_column('turns', sa.Column('cultural_flag', sa.Boolean(), default=False))
    op.add_column('turns', sa.Column('cultural_feedback', sa.Text(), nullable=True))

def downgrade() -> None:
    op.drop_column('turns', 'cultural_feedback')
    op.drop_column('turns', 'cultural_flag')
    op.drop_table('user_proverbs')
    op.drop_table('proverbs')
    op.drop_table('user_scenario_progress')